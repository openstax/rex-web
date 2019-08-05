import { Book } from '../../content/types';
import { getBook } from '../../content/utils/canonicalUrl';
import { AppServices } from '../../types';

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
