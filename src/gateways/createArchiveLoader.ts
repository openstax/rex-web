import { ArchiveBook, ArchiveContent, ArchivePage, VersionedArchiveBookWithConfig } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import { ifUndefined } from '../app/fpUtils';
import { ArchiveBookMissingError, BookNotFoundError, tuple } from '../app/utils';
import { REACT_APP_ARCHIVE_URL_OVERRIDE } from '../config';
import createCache, { Cache } from '../helpers/createCache';
import { acceptStatus } from '../helpers/fetch';
import { BooksConfig } from './createBookConfigLoader';

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

export interface BookOptions {
  bookId: string;
  contentVersion?: string;
  archiveVersion?: string;
  config: BooksConfig;
}

/*
 * if an archive path matches `/apps/archive/123.123` (or similar)
 * this splits the pipeline version from the archive path. for
 * example returning `['/apps/archive/123.123', '123.123']
 */
export const splitStandardArchivePath = (archivePathInput: string) => {
  const [, archivePath, , archiveVersion] = archivePathInput.match(/^(\/apps\/archive(-preview)?\/(.*?))\/?$/i)
    || tuple(undefined, archivePathInput);

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
  const getArchivePathAndVersionForBook = (bookOptions: BookOptions) =>
    REACT_APP_ARCHIVE_URL_OVERRIDE
      ? bookOptions.archiveVersion
        ? tuple(REACT_APP_ARCHIVE_URL_OVERRIDE, bookOptions.archiveVersion)
        : splitStandardArchivePath(REACT_APP_ARCHIVE_URL_OVERRIDE)
      : bookOptions.archiveVersion
        // it would be better if the config had the path base separate
        ? tuple(`/apps/archive/${bookOptions.archiveVersion}`, bookOptions.archiveVersion)
        : splitStandardArchivePath(disablePerBookPinning
          ? bookOptions.config.archiveUrl
          : (bookOptions.config.books[bookOptions.bookId]?.archiveOverride || bookOptions.config.archiveUrl)
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

  const getContentVersionForBook = (bookOptions: BookOptions) =>
    bookOptions.contentVersion
      ? bookOptions.contentVersion
      : bookOptions.config.books[bookOptions.bookId]?.defaultVersion;

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
    archivePath: string,
    archiveVersion: string | undefined,
    explicitVersion: boolean,
    config: BooksConfig
  ) => {
    return (book: ArchiveBook): VersionedArchiveBookWithConfig => ({
      ...book,
      archivePath,
      archiveVersion: archiveVersion || archivePath,
      booksConfig: config,
      contentVersion: book.version,
      explicitVersion,
    });
  };

  const bookLoader = contentsLoader<ArchiveBook, VersionedArchiveBookWithConfig>(bookCache);
  const pageLoader = contentsLoader<ArchivePage, ArchivePage>(pageCache);

  // REMINDER TO ME: you've handled the query param being whatever it may be, but still need
  // to work on differentiating between explicitly set versions and choosing when to specify them
  // when calling loader.book
  const bookInterface = (
    bookId: string,
    contentVersion: string,
    archivePath: string,
    archiveVersion: string | undefined,
    explicitVersion: boolean,
    config: BooksConfig
  ) => {
    const bookRef = `${stripIdVersion(bookId)}@${contentVersion}`;

    return {
      cached: () => bookCache.get(buildCacheKey(archivePath, bookRef)),
      load: () => bookLoader(
        archivePath,
        bookRef,
        versionParamsDecorator(archivePath, archiveVersion, explicitVersion, config)
      ),

      page: (pageId: string) => {
        const bookAndPageRef = `${bookRef}:${pageId}`;
        return {
          cached: () => pageCache.get(buildCacheKey(archivePath, bookAndPageRef)),
          load: () => pageLoader(archivePath, bookAndPageRef, (page) => page),
          url: () => contentUrl(ifUndefined(appPrefix, archivePrefix), archivePath, bookAndPageRef),
        };
      },
    };
  };

  const bookGetter = (bookOptions: BookOptions) => {
    const [archivePath, archiveVersion] = getArchivePathAndVersionForBook(bookOptions);
    const contentVersion = getContentVersionForBook(bookOptions);

    if (!contentVersion) {
      throw new BookNotFoundError(`Could not resolve version for book: ${bookOptions.bookId}`);
    }

    return bookInterface(
      bookOptions.bookId,
      contentVersion,
      archivePath,
      archiveVersion,
      !!(bookOptions.contentVersion || bookOptions.archiveVersion),
      bookOptions.config
    );
  };

  return {
    book: bookGetter,
    forBook: (book: VersionedArchiveBookWithConfig) => bookInterface(
      book.id,
      book.contentVersion,
      book.archivePath,
      book.archiveVersion,
      book.explicitVersion,
      book.booksConfig
    ),
    fromBook: (source: VersionedArchiveBookWithConfig, bookId: string) => source.explicitVersion ? bookInterface(
      bookId,
       // necesary to do cross book links when viewing a specific content version.
      // is this safe to do for canonical links?
      source.contentVersion,
      source.archivePath,
      source.archiveVersion,
      source.explicitVersion,
      source.booksConfig
    ) : bookGetter({bookId, config: source.booksConfig}),
  };
};
