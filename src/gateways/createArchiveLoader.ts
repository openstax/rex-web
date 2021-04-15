import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import createCache, { Cache } from '../helpers/createCache';
import { acceptStatus } from '../helpers/fetch';

/*
 * appUrl is reported to the app for the resolving of relative assets in the content.
 * there are situatons such as pre-rendering using a local proxy where this is different
 * from the actual url that is fetched from.
 */
export default (backendUrl: string, appUrl: string = backendUrl) => {

  const contentUrl = (base: string, ref: string) => `${base}/contents/${ref}.json`;

  const archiveFetch = <T>(fetchUrl: string) => fetch(fetchUrl)
    .then(acceptStatus(200, (status, message) => `Error response from archive "${fetchUrl}" ${status}: ${message}`))
    .then((response) => response.json() as Promise<T>);

  const contentsLoader = <C extends ArchiveContent>(cache: Cache<string, C>) => (id: string) => {
    const cached = cache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return archiveFetch<C>(contentUrl(backendUrl, id))
      .then((response) => {
        cache.set(id, response);
        return response;
      });
  };

  const bookCache = createCache<string, ArchiveBook>({maxRecords: 20});
  const bookLoader = contentsLoader<ArchiveBook>(bookCache);

  const pageCache = createCache<string, ArchivePage>({maxRecords: 20});
  const pageLoader = contentsLoader<ArchivePage>(pageCache);

  return {
    book: (bookId: string, bookVersion: string) => {
      const bookRef = `${stripIdVersion(bookId)}@${bookVersion}`;

      return {
        cached: () => bookCache.get(bookRef),
        load: () => bookLoader(bookRef),

        page: (pageId: string) => {
          const bookAndPageUrl = `${bookRef}:${pageId}`;
          return {
            cached: () => pageCache.get(bookAndPageUrl),
            load: () => pageLoader(bookAndPageUrl),
            url: () => contentUrl(appUrl, bookAndPageUrl),
          };
        },
      };
    },
  };
};
