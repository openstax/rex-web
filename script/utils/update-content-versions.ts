import fs from 'fs';
import path from 'path';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../../src/config';
import books from '../../src/config.books';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';

export interface SimpleBook {
  bookId: string;
  versionNumber: string;
}

const booksPath = path.resolve(__dirname, '../../src/config.books.json');

const bookLoader = (newArchiveUrl?: string) => makeUnifiedBookLoader(
  createArchiveLoader((newArchiveUrl || REACT_APP_ARCHIVE_URL), {
    archivePrefix: ARCHIVE_URL,
  }),
  createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`)
);

async function processBookVersionUpdate(book: SimpleBook, newArchive?: string) {
  const {bookId, versionNumber} = book;
  const { defaultVersion } = books[bookId] || {};
  const newVersion = versionNumber.toString();

  if (defaultVersion === newVersion) {
    // tslint:disable-next-line: no-console
    console.log(`${bookId} already at desired version.`);
    return;
  }

  const { title, version } = await bookLoader(newArchive)(bookId, newVersion)
    .catch((error) => {
      // tslint:disable-next-line: no-console max-line-length
      console.log(`error while loading book ${bookId} with version ${newVersion} using pipeline ${newArchive || REACT_APP_ARCHIVE_URL}`);
      throw error;
    });

  const updatedBooksConfig = { ...books };
  updatedBooksConfig[bookId] = { defaultVersion: version };

  fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');

  // tslint:disable-next-line: no-console
  console.log(`updated ${title}`);
}

export default processBookVersionUpdate;
