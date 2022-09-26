import {
  ArchiveBook,
  ArchiveContent,
  ArchiveLoadOptions,
  ArchivePage,
  VersionedArchiveBookWithConfig
} from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import { ifUndefined } from '../app/fpUtils';
import { ArchiveBookMissingError, BookNotFoundError, tuple } from '../app/utils';
import { REACT_APP_ARCHIVE_URL_OVERRIDE } from '../config';
import createCache, { Cache } from '../helpers/createCache';
import { acceptStatus } from '../helpers/fetch';

interface Options {
  /*
   * appPrefix and archivePrefix can be used if there is a base
   * portion of the content path that must be different between
   * actually loading the content, and where to report the content
   * came from for the purpose of resolving relative urls.
   *
   * pre-rendering is a case where these must be different because
   * it loads content from a different path than it will be served
   * from after release.
   *
   * archivePrefix alone is still helpful because it will be prepended
   * to any book archiveOverride values (in case you need those to have
   * a host, like in scripts)
   */
  appPrefix?: string;
  archivePrefix?: string;

  /*
   * books can specify an archiveOverride in the config.books.json
   * pass true here if you want to disable that.
   *
   * when checking alternate content in pipeline upgrade scripts is an
   * example of when you'd probably want to disable this
   */
  disablePerBookPinning?: boolean;

  bookCache?: Cache<string, VersionedArchiveBookWithConfig>;
  pageCache?: Cache<string, ArchivePage>;
}

const defaultOptions = () => ({
  archivePrefix: '',
  bookCache: createCache<string, VersionedArchiveBookWithConfig>({maxRecords: 20}),
  pageCache: createCache<string, ArchivePage>({maxRecords: 20}),
});

/*
 * if an archive path matches `/apps/archive/123.123` (or similar)
 * this splits the pipeline version from the archive path. for
 * example returning `['/apps/archive/123.123', '123.123']
 */
export const splitStandardArchivePath = (archivePathInput: string) => {
  const [, archivePath, , archiveVersion] = archivePathInput.match(/^(\/apps\/archive(-preview)?\/(.*?))\/?$/i)
    || tuple(undefined, archivePathInput, undefined, undefined);

  return tuple(archivePath, archiveVersion);
};

export default (options: Options = {}) => {
  const {pageCache, bookCache, appPrefix, archivePrefix, disablePerBookPinning} = {
    ...defaultOptions(),
    ...options,
  };

  /*
   * a standard archive path is:
   * - /apps/archive/123.123
   *
   * when the CORGI override is used, it'll be passed into REACT_APP_ARCHIVE_URL_OVERRIDE
   * as something like this:
   * - ?archive=/apps/archive-preview/123.123
   *
   * *note* it might be good to change CORGI to separately pass `/apps/archive-preview`
   * in the REACT_APP_ARCHIVE_URL_OVERRIDE and the `123.123` in the path param. this function
   * should handle either format
   *
   * its also possible for the REACT_APP_ARCHIVE_URL_OVERRIDE to be provided
   * with an arbitrary host, without the same path format, like:
   * - ?archive=https://my-cool-content-server.com
   * - ?archive=http://localhost:5000
   *
   * *note* in this case there *isn't an archive version* in the path, and we have to
   * handle that
   *
   */
  const getArchivePathAndVersionForBook = (bookId: string, loadOptions: ArchiveLoadOptions) =>
    REACT_APP_ARCHIVE_URL_OVERRIDE
      ? loadOptions.archiveVersion
        ? tuple(
          `${REACT_APP_ARCHIVE_URL_OVERRIDE.replace(/\/+$/, '')}/${loadOptions.archiveVersion}`,
          loadOptions.archiveVersion
        )
        : splitStandardArchivePath(REACT_APP_ARCHIVE_URL_OVERRIDE)
      : loadOptions.archiveVersion
        // it would be better if the config had the path base separate
        ? tuple(`/apps/archive/${loadOptions.archiveVersion}`, loadOptions.archiveVersion)
        : splitStandardArchivePath(disablePerBookPinning
          ? loadOptions.booksConfig.archiveUrl
          : (loadOptions.booksConfig.books[bookId]?.archiveOverride || loadOptions.booksConfig.archiveUrl)
        )
    ;

  /*
   * in the browser we assume that `host`, which comes from one of the prefix arguments,
   * will definitely be `''`, in this way a REACT_APP_ARCHIVE_URL_OVERRIDE that is passed
   * with a full base url will work as intended, and any path that is just a path
   * will also work relative to the current host
   */
  const contentUrl = (host: string, archivePath: string, ref: string) =>
    `${host}${archivePath}/contents/${ref}.json`;

  const getContentVersionForBook = (bookId: string, loadOptions: ArchiveLoadOptions) =>
    loadOptions.contentVersion !== undefined
      ? loadOptions.contentVersion
      : loadOptions.booksConfig.books[bookId]?.defaultVersion;

  const buildCacheKey = (archivePath: string, contentRef: string) => `${archivePath}:${contentRef}`;

  const archiveFetch = <T>(fetchUrl: string) => fetch(fetchUrl)
    .then(acceptStatus(200, (status, message) =>
      new ArchiveBookMissingError(`Error response from archive "${fetchUrl}" ${status}: ${message}`)))
    .then((response) => response.json() as Promise<T>);

  const contentsLoader = <C extends ArchiveContent, R>(cache: Cache<string, R>) =>
    (archivePath: string, contentRef: string, decorator: (result: C) => R) => {
      const cacheKey = buildCacheKey(archivePath, contentRef);
      const cached = cache.get(cacheKey);
      if (cached) {
        return Promise.resolve(cached);
      }

      return archiveFetch<C>(contentUrl(archivePrefix, archivePath, contentRef))
        .then(decorator)
        .then((response) => {
          cache.set(cacheKey, response);
          return response;
        });
    };

  const versionParamsDecorator = (
    loadOptions: ArchiveLoadOptions,
    archivePath: string,
    archiveVersion: string | undefined
  ) => {
    return (book: ArchiveBook): VersionedArchiveBookWithConfig => ({
      ...book,
      archiveVersion: archiveVersion || archivePath,
      contentVersion: book.version,
      loadOptions,
    });
  };

  const bookLoader = contentsLoader<ArchiveBook, VersionedArchiveBookWithConfig>(bookCache);
  const pageLoader = contentsLoader<ArchivePage, ArchivePage>(pageCache);

  const bookInterface = (
    bookId: string,
    loadOptions: ArchiveLoadOptions
  ) => {
    // there are situations where `archiveVersion` will be unknown, its only for tracking, the
    // `archivePath` is whats actually used for loading things
    const [archivePath, archiveVersion] = getArchivePathAndVersionForBook(bookId, loadOptions);
    const contentVersion = getContentVersionForBook(bookId, loadOptions);

    if (!contentVersion) {
      throw new BookNotFoundError(`Could not resolve version for book: ${bookId}`);
    }

    const bookRef = `${stripIdVersion(bookId)}@${contentVersion}`;

    return {
      cached: () => bookCache.get(buildCacheKey(archivePath, bookRef)),
      load: () => bookLoader(
        archivePath,
        bookRef,
        versionParamsDecorator(loadOptions, archivePath, archiveVersion)
      ),
      page: (pageId: string) => {
        const bookAndPageRef = `${bookRef}:${pageId}`;
        return {
          cached: () => pageCache.get(buildCacheKey(archivePath, bookAndPageRef)),
          load: () => pageLoader(archivePath, bookAndPageRef, (page) => page),
          url: () => contentUrl(ifUndefined(appPrefix, archivePrefix), archivePath, bookAndPageRef),
        };
      },
      url: () => contentUrl(ifUndefined(appPrefix, archivePrefix), archivePath, bookRef),
    };
  };

  const bookGetter = (bookId: string, loadOptions: ArchiveLoadOptions) => {
    return bookInterface(
      bookId,
      loadOptions
    );
  };

  return {
    book: bookGetter,
    /*
     * creates a new loader for the given book using the same params
     * used to load this data.
     */
    forBook: (book: VersionedArchiveBookWithConfig) => bookInterface(
      book.id,
      book.loadOptions
    ),
    /*
     * creates a new loader for a different book using the same params
     * use dto load this data. (to ensure that the intended reference is
     * resolved correctly, for cross book references like links or canonicals.
     */
    fromBook: (source: VersionedArchiveBookWithConfig, bookId: string) => bookInterface(
      bookId,
      source.loadOptions
    ),
  };
};
