import { Book } from '../../content/types';
import { formatBookData } from '../../content/utils';
import { AppServices } from '../../types';

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => async(bookId: string, bookVersion: string) => {
  const bookLoader = archiveLoader.book(bookId, bookVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();

  return formatBookData(archiveBook, osWebBook);
};

export async function getBooks(
    archiveLoader: AppServices['archiveLoader'],
    osWebLoader: AppServices['osWebLoader'],
    bookEntries: Array<[string, {defaultVersion: string}]>) {

  const books: Book[] = [];
  const unifiedLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  for (const [bookId, {defaultVersion}] of bookEntries) {
    books.push(await unifiedLoader(bookId, defaultVersion));
  }
  return books;
}
