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
            id: 'pagelongid',
            shortId: 'page',
            title: 'page title',
          },
          {
            id: 'pagelongid2',
            shortId: 'page2',
            title: 'page title2',
          },
        ],
        id: 'chapterid',
        shortId: 'chapter',
        title: 'chapter title',
      },
    ],
    id: 'booklongid',
    shortId: 'book',
    title: 'book title',
  },
  version: '0',
} as ArchiveBook;

export const page = {
  content: 'some page content yo',
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
  version: '0',
} as ArchivePage;

export const pageWithContentReference = {
  content: 'some /contents/pagelongid content',
  id: 'pagelongid2',
  shortId: 'page2',
  title: 'page title2',
  version: '0',
} as ArchivePage;

const books: {[key: string]: ArchiveBook} = {
  book,
  'booklongid': book,
  'booklongid@0': book,
};

const bookPages: {[key: string]: {[key: string]: ArchivePage}} = {
  booklongid: {
    page,
    page2: pageWithContentReference,
    pagelongid: page,
    pagelongid2: pageWithContentReference,
  },
};

const resolveBook = (bookId: string, bookVersion: string | undefined) => bookVersion !== undefined
  ? books[`${bookId}@${bookVersion}`] as ArchiveBook | undefined
  : books[bookId] as ArchiveBook | undefined;

export default () => {
  const loadBook = jest.fn((bookId, bookVersion) => {
    const bookData = resolveBook(bookId, bookVersion);
    return bookData ? Promise.resolve(bookData) : Promise.reject();
  });
  const loadPage = jest.fn((bookId, bookVersion, pageId) => {
    const bookData = resolveBook(bookId, bookVersion);
    const pageData = bookData && bookPages[bookData.id][pageId];
    return pageData ? Promise.resolve(pageData) : Promise.reject();
  });
  const cachedBook = jest.fn((bookId, bookVersion) => {
    return resolveBook(bookId, bookVersion);
  });
  const cachedPage = jest.fn((bookId, bookVersion, pageId) => {
    const bookData = resolveBook(bookId, bookVersion);
    return bookData && bookPages[bookData.id][pageId];
  });

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
