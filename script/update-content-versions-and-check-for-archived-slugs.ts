import fs from 'fs';
import path from 'path';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import books from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import updateRedirectsData from './utils/update-redirects-data';

export interface NewBookVersion {
  bookId: string;
  versionNumber: string;
}

const booksPath = path.resolve(__dirname, '../src/config.books.json');

const bookLoader = makeUnifiedBookLoader(
  createArchiveLoader(REACT_APP_ARCHIVE_URL, {
    archivePrefix: ARCHIVE_URL,
  }),
  createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`)
);

async function updateRedirections(bookId: string, currentVersion: string, newVersion: string) {
  if (currentVersion === newVersion) {
    return 0;
  }

  const currentBook = await bookLoader(bookId, currentVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with defaultVersion ${currentVersion}`);
      throw error;
    });

  const newBook = await bookLoader(bookId, newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with newVersion ${newVersion}`);
      throw error;
    });

  return updateRedirectsData(currentBook, newBook);
}

async function processBook(book: NewBookVersion) {
  const {bookId, versionNumber} = book;
  const { defaultVersion } = books[bookId] || {};
  const newVersion = versionNumber.toString();

  if (defaultVersion === newVersion) {
    // tslint:disable-next-line: no-console
    console.log(`${bookId} already at desired version.`);
    process.exit(0);
  }

  const { title, version } = await bookLoader(bookId, newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${bookId} with version ${newVersion}`);
      throw error;
    });

  const updatedBooksConfig = { ...books };
  updatedBooksConfig[bookId] = { defaultVersion: version };

  fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');

  // defaultVersion will be undefined when we add a new book.
  // In this case we don't need to updateRedirections because there is nothing to update.
  const newRedirectionsCounter = defaultVersion
    ? await updateRedirections(bookId, defaultVersion, newVersion)
    : 0;
}

export default processBook;
