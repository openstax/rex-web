import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import { ifUndefined } from '../app/fpUtils';
import { ArchiveBookMissingError } from '../app/utils';
import createCache, { Cache } from '../helpers/createCache';
import { acceptStatus } from '../helpers/fetch';
import { getBookVersionFromUUIDSync } from './createBookConfigLoader';

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
   * when passing an override query parameter in development, or when
   * checking alternate content in pipeline upgrade scripts, are examples
   * of when you'd probably want to disable this
   */
  disablePerBookPinning?: boolean;

  bookCache?: Cache<string, ArchiveBook>;
  pageCache?: Cache<string, ArchivePage>;
}

const defaultOptions = () => ({
  archivePrefix: '',
  bookCache: createCache<string, ArchiveBook>({maxRecords: 20}),
  pageCache: createCache<string, ArchivePage>({maxRecords: 20}),
});

export default (getArchivePath: () => string, options: Options = {}) => {
  const {pageCache, bookCache, appPrefix, archivePrefix, disablePerBookPinning} = {
    ...defaultOptions(),
    ...options,
  };

  const contentUrlBase = (host: string, bookId: string) => {
    const archivePath = getArchivePath();
    return disablePerBookPinning
      ? `${host}${archivePath}`
      : `${host}${getBookVersionFromUUIDSync(bookId)?.archiveOverride || archivePath}`;
  };
  const contentUrl = (host: string, bookId: string, ref: string) =>
    `${contentUrlBase(host, bookId)}/contents/${ref}.json`;

  const archiveFetch = <T>(fetchUrl: string) => fetch(fetchUrl)
    .then(acceptStatus(200, (status, message) =>
      new ArchiveBookMissingError(`Error response from archive "${fetchUrl}" ${status}: ${message}`)))
    .then((response) => response.json() as Promise<T>);

  const contentsLoader = <C extends ArchiveContent>(cache: Cache<string, C>) =>
    (bookId: string, id: string) => {
      const cached = cache.get(id);
      if (cached) {
        return Promise.resolve(cached);
      }

      return archiveFetch<C>(contentUrl(archivePrefix, bookId, id))
        .then((response) => {
          cache.set(id, response);
          return response;
        });
  };

  const bookLoader = contentsLoader<ArchiveBook>(bookCache);
  const pageLoader = contentsLoader<ArchivePage>(pageCache);

  return {
    book: (bookId: string, bookVersion: string) => {
      const bookRef = `${stripIdVersion(bookId)}@${bookVersion}`;

      return {
        cached: () => bookCache.get(bookRef),
        load: () => bookLoader(bookId, bookRef),

        page: (pageId: string) => {
          const bookAndPageRef = `${bookRef}:${pageId}`;
          return {
            cached: () => pageCache.get(bookAndPageRef),
            load: () => pageLoader(bookId, bookAndPageRef),
            url: () => contentUrl(ifUndefined(appPrefix, archivePrefix), bookId, bookAndPageRef),
          };
        },
      };
    },
  };
};
