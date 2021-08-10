import fs from 'fs';
import path from 'path';
import argv from 'yargs';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import books from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import updateRedirectsData from './utils/update-redirects-data';

const args = argv.string('versionNumber').argv as any as {
  bookId: string
  versionNumber: string | number;
};

const booksPath = path.resolve(__dirname, '../src/config.books.json');

const bookLoader = makeUnifiedBookLoader(
  createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`),
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

async function processBook() {
  const { defaultVersion } = books[args.bookId] || {};
  const newVersion = args.versionNumber.toString();

  if (defaultVersion === newVersion) {
    // tslint:disable-next-line: no-console
    console.log(`${args.bookId} alredy at desired version.`);
    process.exit(0);
  }

  const { title, version } = await bookLoader(args.bookId, newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console
      console.log(`error while loading book ${args.bookId} with version ${newVersion}`);
      throw error;
    });

  const updatedBooksConfig = { ...books };
  updatedBooksConfig[args.bookId] = { defaultVersion: version };

  fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');

  // defaultVersion will be undefined when we add a new book.
  // In this case we don't need to updateRedirections because there is nothing to update.
  const newRedirectionsCounter = defaultVersion
    ? await updateRedirections(args.bookId, defaultVersion, newVersion)
    : 0;

  // tslint:disable-next-line: no-console
  console.log(`updated ${title} and added ${newRedirectionsCounter} new redirections`);
}

processBook().catch(() => {
  process.exit(1);
});
