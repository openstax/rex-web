// tslint:disable: max-line-length
import fs from 'fs';
import cloneDeep from 'lodash/fp/cloneDeep';
import path from 'path';
import { ArchiveBook, ArchivePage, VersionedArchiveBookWithConfig } from '../../app/content/types';
import { findArchiveTreeNodeById } from '../../app/content/utils/archiveTreeUtils';
import { BookOptions, splitStandardArchivePath } from '../../gateways/createArchiveLoader';

export const book = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-shortid.json'), 'utf8')
) as ArchiveBook;

export const bookWithUnits = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apps/archive/codeversion/contents/testbook1-units.json'), 'utf8')
) as ArchiveBook;

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

  const decorateArchiveBook = (options: BookOptions, result?: ArchiveBook | undefined): VersionedArchiveBookWithConfig | undefined => result ? {
    ...result,
    archivePath: options.archiveVersion
      ? `/apps/archive/${options.archiveVersion}`
      : (options.config.books[result.id]?.archiveOverride || options.config.archiveUrl),
    archiveVersion: options.archiveVersion
      ? options.archiveVersion
      : splitStandardArchivePath(options.config.books[result.id]?.archiveOverride || options.config.archiveUrl)[1] as string,
    booksConfig: options.config,
    contentVersion: result.version,
  } : undefined;

  const resolveBook = (options: BookOptions) => decorateArchiveBook(options, localBooks[`${options.bookId}@${options.contentVersion}`]);

  const loadBook = jest.fn((options: BookOptions) => {
    const bookData = resolveBook(options);
    return bookData
      ? Promise.resolve(bookData)
      : Promise.reject(new Error(`failed to load book data ${options.bookId}@${options.contentVersion}`))
    ;
  });
  const loadPage = jest.fn((bookId, bookVersion, pageId) => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    const pageData = pages && pages[pageId];
    return pageData ? Promise.resolve(pageData) : Promise.reject();
  });
  const cachedBook = jest.fn((options: BookOptions) => {
    return resolveBook(options);
  });
  const cachedPage = jest.fn((bookId, bookVersion, pageId): ArchivePage | undefined => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    return pages && pages[pageId];
  });

  return {
    book: (options: BookOptions) => ({
      cached: () => cachedBook(options),
      load: () => loadBook(options),

      page: (pageId: string) => ({
        cached: () => cachedPage(options.bookId, options.contentVersion, pageId),
        load: () => loadPage(options.bookId, options.contentVersion, pageId),
        url: () => '/someUrl',
      }),
    }),
    forBook: (source: VersionedArchiveBookWithConfig) => ({
      cached: () => cachedBook({config: source.booksConfig, bookId: source.id, archiveVersion: source.archiveVersion}),
      load: () => loadBook({config: source.booksConfig, bookId: source.id, archiveVersion: source.archiveVersion}),

      page: (pageId: string) => ({
        cached: () => cachedPage(source.id, source.contentVersion, pageId),
        load: () => loadPage(source.id, source.contentVersion, pageId),
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
