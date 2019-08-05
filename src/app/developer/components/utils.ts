import { Book } from '../../content/types';
import { formatBookData } from '../../content/utils';
import { AppServices } from '../../types';

export async function getBooks(
    archiveLoader: AppServices['archiveLoader'],
    osWebLoader: AppServices['osWebLoader'],
    bookEntries: Array<[string, {defaultVersion: string}]>) {

  const books: Book[] = [];

  for (const [bookId, {defaultVersion}] of bookEntries) {
    books.push(await getBook(bookId, defaultVersion, archiveLoader, osWebLoader));
  }
  return books;
}

export async function getBook(
    bookId: string, 
    defaultVersion: string,
    archiveLoader: AppServices['archiveLoader'],
    osWebLoader: AppServices['osWebLoader']) {
  const bookLoader = archiveLoader.book(bookId, defaultVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();
  return formatBookData(archiveBook, osWebBook)
}