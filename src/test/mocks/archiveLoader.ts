import cloneDeep from 'lodash/cloneDeep';
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

const books: {[key: string]: ArchiveBook} = {
  book,
  'booklongid': book,
  'booklongid@0': book,
};

const bookPages: {[key: string]: {[key: string]: ArchivePage}} = {
  booklongid: {
    page,
    pagelongid: page,
  },
};

export default () => {
  const localBooks = cloneDeep(books);
  const localBookPages = cloneDeep(bookPages);

  const resolveBook = (bookId: string, bookVersion: string | undefined) => bookVersion !== undefined
    ? localBooks[`${bookId}@${bookVersion}`]
    : localBooks[bookId];

  const loadBook = jest.fn((bookId, bookVersion) => {
    const bookData = resolveBook(bookId, bookVersion);
    return bookData ? Promise.resolve(bookData) : Promise.reject();
  });
  const loadPage = jest.fn((bookId, bookVersion, pageId) => {
    const bookData = resolveBook(bookId, bookVersion);
    const pageData = bookData && localBookPages[bookData.id][pageId];
    return pageData ? Promise.resolve(pageData) : Promise.reject();
  });
  const cachedBook = jest.fn((bookId, bookVersion) => {
    return resolveBook(bookId, bookVersion);
  });
  const cachedPage = jest.fn((bookId, bookVersion, pageId) => {
    const bookData = resolveBook(bookId, bookVersion);
    return bookData && localBookPages[bookData.id][pageId];
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
    mockPage: (parentBook: ArchiveBook, newPage: ArchivePage) => {
      localBookPages[parentBook.id][newPage.id] = newPage;
      localBookPages[parentBook.id][newPage.shortId] = newPage;
      localBooks[parentBook.id].tree.contents.push({
        id: `${newPage.id}@${newPage.version}`,
        shortId: `${newPage.shortId}@${newPage.version}`,
        title: newPage.title,
      });
    },
  };
};
