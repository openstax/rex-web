// tslint:disable: max-line-length
import fs from 'fs';
import cloneDeep from 'lodash/fp/cloneDeep';
import path from 'path';
import { ArchiveBook, ArchiveLoadOptions, ArchivePage, VersionedArchiveBookWithConfig } from '../../app/content/types';
import { findArchiveTreeNodeById } from '../../app/content/utils/archiveTreeUtils';
import { fromRelativeUrl } from '../../app/content/utils/urlUtils';
import { BookNotFoundError } from '../../app/utils';
import { Books } from '../../config.books';
import { splitStandardArchivePath } from '../../gateways/createArchiveLoader';
import { BooksConfig } from '../../gateways/createBookConfigLoader';

const appPrefix = 'https://localhost:3000';
const baseUrl = `${appPrefix}/apps/archive/codeversion`;

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
    [pageInChapter.id]: pageInChapter,
  },
};

const resources: {[key: string]: string} = {
  [`${baseUrl}/resources/styles/test-styles.css`]: '.cool { color: blue; }',
};

export default () => {
  const localBooks = cloneDeep(books);
  const localBookPages = cloneDeep(bookPages);
  const localResources = cloneDeep(resources);

  const getBookVersion = (bookId: string, options: ArchiveLoadOptions) =>
    options.contentVersion !== undefined
        ? options.contentVersion
        : options.booksConfig.books[bookId]?.defaultVersion
  ;

  const resolveBook = (bookId: string, options: ArchiveLoadOptions) => {
    const version = getBookVersion(bookId, options);

    if (!version) {
      throw new BookNotFoundError(`Could not resolve version for book: ${bookId}`);
    }
    return localBooks[`${bookId}@${version}`]
      ? decorateArchiveBook(options, localBooks[`${bookId}@${version}`])
      : undefined;
  };

  const resourceUrl = (resourceRef: string) =>
    fromRelativeUrl(`${baseUrl}/content/bookref.json`, resourceRef);

  const resolveResource = (resourceRef: string) =>
    localResources[resourceUrl(resourceRef)];

  const loadBook = jest.fn(async(bookId: string, options: ArchiveLoadOptions) => {
    const bookData = resolveBook(bookId, options);
    return bookData
      ? Promise.resolve(bookData)
      : Promise.reject(new Error(`failed to load book data ${bookId}@${options.contentVersion}`))
    ;
  });
  const loadPage = jest.fn(async(bookId, bookVersion, pageId) => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    const pageData = pages && pages[pageId];
    return pageData ? Promise.resolve(pageData) : Promise.reject(new Error(`failed to load page data ${pageId}`));
  });
  const loadResource = jest.fn(async(resourceRef: string) => {
    const resourceData = resolveResource(resourceRef);
    return resourceData ? Promise.resolve(resourceData) : Promise.reject(new Error(`failed to load resource data ${resourceRef}`));
  });

  const cachedBook = jest.fn((bookId: string, options: ArchiveLoadOptions) => {
    return resolveBook(bookId, options);
  });
  const cachedPage = jest.fn((bookId, bookVersion, pageId): ArchivePage | undefined => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    return pages && pages[pageId];
  });
  const cachedResource = jest.fn(resolveResource);

  const makeBook = (bookId: string, options: ArchiveLoadOptions) => ({
    cached: () => cachedBook(bookId, options),
    load: () => loadBook(bookId, options),
    url: () => '/apps/archive/codeversion/content/bookref',

    page: (pageId: string) => ({
      cached: () => cachedPage(bookId, getBookVersion(bookId, options), pageId),
      load: () => loadPage(bookId, getBookVersion(bookId, options), pageId),
      url: () => '/apps/archive/codeversion/content/pageref',
    }),
    resource: (resourceRef: string) => ({
      cached: () => cachedResource(resourceRef),
      load: () => loadResource(resourceRef),
      url: () => '/apps/archive/codeversion/resources/resourceref',
    }),
  });

  return {
    book: makeBook,
    forBook: (source: VersionedArchiveBookWithConfig) => makeBook(source.id, source.loadOptions),
    fromBook: (source: VersionedArchiveBookWithConfig, bookId: string) => makeBook(bookId, source.loadOptions),
    mock: { cachedBook, cachedPage, cachedResource, loadBook, loadPage, loadResource },
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
