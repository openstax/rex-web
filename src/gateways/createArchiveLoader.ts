import memoize from 'lodash/fp/memoize';
import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import { acceptStatus } from '../helpers/fetch';

export default (url: string) => {
  const cache = new Map();
  const loader = memoize((id: string) => fetch(`${url}/${id}`)
    .then(acceptStatus(200, (status, message) => `Error response from archive "${url}/${id}" ${status}: ${message}`))
    .then((response) => response.json() as Promise<ArchiveContent>)
    .then((response) => {
      cache.set(id, response);
      return response;
    })
  );

  return {
    book: (bookId: string, bookVersion: string | undefined) => {
      const bookRef = bookVersion ? `${stripIdVersion(bookId)}@${bookVersion}` : stripIdVersion(bookId);

      return {
        cached: () => cache.get(bookRef) as ArchiveBook | undefined,
        load: () => loader(bookRef) as Promise<ArchiveBook>,

        page: (pageId: string) => ({
          cached: () => cache.get(`${bookRef}:${pageId}`) as ArchivePage | undefined,
          load: () => loader(`${bookRef}:${pageId}`) as Promise<ArchivePage>,
        }),
      };
    },
  };
};
