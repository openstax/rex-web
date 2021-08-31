import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import BOOKS from '../config.books';
import createCache, { Cache } from '../helpers/createCache';
import { acceptStatus } from '../helpers/fetch';

interface Options {
  appHost?: string; /* alternate host to report to the app for resolving relative links in content */
  archiveHost?: string; /* this is prefixed on the url unless archiveOverride is passed */
  archiveOverride?: string; /* this will for sure be used if passed */
  bookCache?: Cache<string, ArchiveBook>;
  pageCache?: Cache<string, ArchivePage>;
}

const defaultOptions = () => ({
  archiveHost: '',
  bookCache: createCache<string, ArchiveBook>({maxRecords: 20}),
  pageCache: createCache<string, ArchivePage>({maxRecords: 20}),
});

export default (archiveBasePath: string, options: Options = {}) => {
  const {pageCache, bookCache, appHost, archiveHost, archiveOverride} = {
    ...defaultOptions(),
    ...options,
  };

  const contentUrlBase = (host: string, bookId: string) => archiveOverride ||
    `${host}${BOOKS[bookId]?.archiveOverride || archiveBasePath}`;
  const contentUrl = (host: string, bookId: string, ref: string) =>
    `${contentUrlBase(host, bookId)}/contents/${ref}.json`;

  const archiveFetch = <T>(fetchUrl: string) => fetch(fetchUrl)
    .then(acceptStatus(200, (status, message) => `Error response from archive "${fetchUrl}" ${status}: ${message}`))
    .then((response) => response.json() as Promise<T>);

  const contentsLoader = <C extends ArchiveContent>(cache: Cache<string, C>) => (bookId: string, id: string) => {
    const cached = cache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return archiveFetch<C>(contentUrl(archiveHost, bookId, id))
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
            url: () => contentUrl(appHost || archiveHost, bookId, bookAndPageRef),
          };
        },
      };
    },
  };
};
