// tslint:disable: max-line-length
import fs from 'fs';
import cloneDeep from 'lodash/fp/cloneDeep';
import path from 'path';
import { ArchiveBook, ArchiveLoadOptions, ArchivePage, VersionedArchiveBookWithConfig } from '../../app/content/types';
import { findArchiveTreeNodeById } from '../../app/content/utils/archiveTreeUtils';
import { Books } from '../../config.books';
import { splitStandardArchivePath } from '../../gateways/createArchiveLoader';
import { BooksConfig } from '../../gateways/createBookConfigLoader';

const decorateArchiveBook = (options: ArchiveLoadOptions, result: ArchiveBook): VersionedArchiveBookWithConfig => ({
  ...result,
  archiveVersion: options.archiveVersion
    ? options.archiveVersion
    : splitStandardArchivePath(options.booksConfig.books[result.id]?.archiveOverride || options.booksConfig.archiveUrl)[1] as string,
  contentVersion: result.version,
  loadOptions: options,
});

const mockBooks: Books = {
  'testbook1-units': {
    defaultVersion: '1.0',
  },
  'testbook1-uuid': {
    defaultVersion: '1.0',
  },
};

const booksConfig: BooksConfig = {
  archiveUrl: '/test/archive-url',
  books: mockBooks,
};

export const book = decorateArchiveBook({booksConfig}, JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid.json'), 'utf8')
) as ArchiveBook);

export const bookWithUnits = decorateArchiveBook({booksConfig}, JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-units.json'), 'utf8')
) as ArchiveBook);

export const page = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid:testpage1-shortid.json'), 'utf8')
) as ArchivePage;

export const shortPage = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid:testpage4-shortid.json'), 'utf8')
) as ArchivePage;

export const pageInChapter = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid:testpage6-shortid.json'), 'utf8')
) as ArchivePage;

export const pageInOtherChapter = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid:testpage7-shortid.json'), 'utf8')
) as ArchivePage;

export const lastPage = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid:testpage12-shortid.json'), 'utf8')
) as ArchivePage;

const books: {[key: string]: ArchiveBook} = {
  [`${book.id}@${book.version}`]: book,
};

const bookPages: {[key: string]: {[key: string]: ArchivePage}} = {
  [`${book.id}@${book.version}`]: {
    [page.id]: page,
    [shortPage.id]: shortPage,
  },
};

export default () => {
  const localBooks = cloneDeep(books);
  const localBookPages = cloneDeep(bookPages);

  const resolveBook = (bookId: string, options: ArchiveLoadOptions) => localBooks[`${bookId}@${options.contentVersion}`]
    ? decorateArchiveBook(options, localBooks[`${bookId}@${options.contentVersion}`])
    : undefined;

  const loadBook = jest.fn((bookId: string, options: ArchiveLoadOptions) => {
    const bookData = resolveBook(bookId, options);
    return bookData
      ? Promise.resolve(bookData)
      : Promise.reject(new Error(`failed to load book data ${bookId}@${options.contentVersion}`))
    ;
  });
  const loadPage = jest.fn((bookId, bookVersion, pageId) => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    const pageData = pages && pages[pageId];
    return pageData ? Promise.resolve(pageData) : Promise.reject();
  });
  const cachedBook = jest.fn((bookId: string, options: ArchiveLoadOptions) => {
    return resolveBook(bookId, options);
  });
  const cachedPage = jest.fn((bookId, bookVersion, pageId): ArchivePage | undefined => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    return pages && pages[pageId];
  });

  return {
    book: (bookId: string, options: ArchiveLoadOptions) => ({
      cached: () => cachedBook(bookId, options),
      load: () => loadBook(bookId, options),

      page: (pageId: string) => ({
        cached: () => cachedPage(bookId, options.contentVersion, pageId),
        load: () => loadPage(bookId, options.contentVersion, pageId),
        url: () => '/someUrl',
      }),
    }),
    forBook: (source: VersionedArchiveBookWithConfig) => ({
      cached: () => cachedBook(source.id, source.loadOptions),
      load: () => loadBook(source.id, source.loadOptions),

      page: (pageId: string) => ({
        cached: () => cachedPage(source.id, source.contentVersion, pageId),
        load: () => loadPage(source.id, source.contentVersion, pageId),
        url: () => '/someUrl',
      }),
    }),
    fromBook: (source: VersionedArchiveBookWithConfig, bookId: string) => ({
      cached: () => cachedBook(bookId, source.loadOptions),
      load: () => loadBook(bookId, source.loadOptions),

      page: (pageId: string) => ({
        cached: () => cachedPage(bookId, source.contentVersion, pageId),
        load: () => loadPage(bookId, source.contentVersion, pageId),
        url: () => '/someUrl',
      }),
    }),
    mock: { loadBook, loadPage, cachedBook, cachedPage },
    mockBook: (newBook: ArchiveBook) => {
      localBooks[`${newBook.id}@${newBook.version}`] = newBook;
      localBookPages[`${newBook.id}@${newBook.version}`] = {};
    },
    mockPage: (parentBook: ArchiveBook, newPage: ArchivePage, pageSlug: string) => {
      localBookPages[`${parentBook.id}@${parentBook.version}`][newPage.id] = newPage;
      const currentBook = localBooks[`${parentBook.id}@${parentBook.version}`];
      const treeNode = findArchiveTreeNodeById(currentBook.tree, newPage.id);
      if (!treeNode) {
        currentBook.tree.contents.push({
          id: `${newPage.id}@1.0`,
          slug: pageSlug,
          title: newPage.title,
        });
      }
    },
  };
};
