import { ArchiveBook, ArchivePage } from '../../app/content/types';

export const book = {
  id: 'booklongid',
  shortId: 'book',
  title: 'book title',
  tree: {
    contents: [
      {
        contents: [
          {
            id: 'pagelongid2',
            shortId: 'page2',
            title: 'page title2',
          },
        ],
        id: 'pagelongid',
        shortId: 'page',
        title: 'page title',
      },
    ],
    id: 'booklongid',
    shortId: 'book',
    title: 'book title',
  },
  version: '0',
};

export const page = {
  content: 'some page content yo',
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
  version: '0',
};

export default () => {
  const loadBook = jest.fn(() => Promise.resolve(book as ArchiveBook));
  const loadPage = jest.fn(() => Promise.resolve(page as ArchivePage));
  const cachedBook = jest.fn(() => (book as ArchiveBook));
  const cachedPage = jest.fn(() => (page as ArchivePage));

  return {
    book: (bookId: string, bookVersion: string | undefined) => ({
      cached: () => cachedBook(bookId, bookVersion),
      load: () => loadBook(bookId, bookVersion),

      page: (pageId: string) => ({
        cached: () => cachedPage(bookId, bookVersion, pageId),
        load: () => loadPage(bookId, bookVersion, pageId),
      }),
    }),
    mock: { loadBook, loadPage, cachedBook, cachedPage },
  };
};
