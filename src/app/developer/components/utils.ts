import { Book } from '../../content/types';
import { formatBookData, getUrlParamForPageId } from '../../content/utils';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { BOOKS } from '../../../config';

// from https://docs.google.com/spreadsheets/d/1Hj5vm2AbEiLgxgcbNRi550InzFTLvBOv16-Fw6P-c5E/edit#gid=2066350488
const CANONICAL_MAP: ObjectLiteral<string[] | undefined> = {
  /* Algebra & Trigonometry */ '13ac107a-f15f-49d2-97e8-60ab2e3b519c' : [
    /* College Algebra */ '9b08c294-057f-4201-9f48-5d6ad992740d',
    /* Precalculus */ 'fd53eae1-fa23-47c7-bb1b-972349835c3c',
  ],
  /* Precalculus */ 'fd53eae1-fa23-47c7-bb1b-972349835c3c' : [ /* College Algebra */ '9b08c294-057f-4201-9f48-5d6ad992740d' ],
  /* Chemistry: Atoms First 2e */ 'd9b85ee6-c57f-4861-8208-5ddf261e9c5f' : [ /* Chemistry 2e */ '7fccc9cf-9b71-44f6-800b-f9457fd64335' ],
  /* Introductory Business Statistics */ 'b56bb9e9-5eb8-48ef-9939-88b1b12ce22f': [ /* Introductory Statistics */ '30189442-6998-4686-ac05-ed152b91b9de' ],
  /* Principles of Macroeconomics 2e */ '27f59064-990e-48f1-b604-5188b9086c29': [ /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82' ],
  /* Principles of Microeconomics 2e */ '5c09762c-b540-47d3-9541-dda1f44f16e5': [ /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82' ],
  /* Principles of Macroeconomics 2e for AP Courses */ '9117cf8c-a8a3-4875-8361-9cb0f1fc9362': [ /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82' ],
  /* Principles of Microeconomics 2e for AP Courses */ '636cbfd9-4e37-4575-83ab-9dec9029ca4e': [ /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82' ],  
};

interface ObjectLiteral<V> {
  [key: string]: V;
}

export async function getBooks(
    archiveLoader: AppServices['archiveLoader'],
    osWebLoader: AppServices['osWebLoader'],
    bookEntries: Array<[string, {defaultVersion: string}]>) {

  const books: Book[] = [];

  for (const [bookId, {defaultVersion}] of bookEntries) {
    books.push(await getBook(archiveLoader, osWebLoader, bookId, defaultVersion));
  }
  return books;
}

async function getBook(
    archiveLoader: AppServices['archiveLoader'],
    osWebLoader: AppServices['osWebLoader'],
    bookId: string, 
    defaultVersion: string) {
  const bookLoader = archiveLoader.book(bookId, defaultVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();
  return formatBookData(archiveBook, osWebBook)
}

export async function getCanonicalUrl(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  bookId: string,
  pageShortId: string,
) {
  const canonicals: string[] = CANONICAL_MAP[bookId] || [];
  for (const id of canonicals) {
    const version = assertDefined(BOOKS[id], `Could not find ${id} in BOOKS config`).defaultVersion;

    const canonicalBook = await getBook(archiveLoader, osWebLoader, id, version);
    const pageInBook = getUrlParamForPageId(canonicalBook, pageShortId, true);

    if (pageInBook) {
      return {bookSlug: canonicalBook.slug, pageSlug: pageInBook}
    }
  }
  
  return null
}