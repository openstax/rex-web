import memoize from 'lodash/fp/memoize';
import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';

export default (url: string) => {
  const cache = new Map();
  const loader = memoize((id: string) => fetch(url + id)
    .then((response) => {
      if (response.status !== 200) {
        return response.text().then((message: string) => {
          throw new Error(`Error response from archive ${response.status}: ${message}`);
        });
      }
      return response;
    })
    .then((response) => response.json() as Promise<ArchiveContent>)
    .then((response) => {
      cache.set(id, response);
      return response;
    })
  );

  return {
    book: (bookId: string) => loader(bookId) as Promise<ArchiveBook>,
    cachedBook: (bookId: string) => cache.get(bookId) as ArchiveBook | undefined,
    cachedPage: (bookId: string, pageId: string) => cache.get(`${bookId}:${pageId}`) as ArchivePage | undefined,
    page: (bookId: string, pageId: string) => loader(`${bookId}:${pageId}`) as Promise<ArchivePage>,
  };
};
