import fetch from 'node-fetch';
import { argv } from 'yargs';
import { ARCHIVE_URL, BOOKS, REACT_APP_ARCHIVE_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';

const {
  field,
} = argv as {
  field?: string;
};

(global as any).fetch = fetch;

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`);

const bookId = argv._[1];
const bookVersion = BOOKS[bookId].defaultVersion;
archiveLoader.book(bookId, bookVersion).load().then((book: any) => {
  if (field) {
    // tslint:disable-next-line:no-console
    console.log(book[field]);
  } else {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(book, null, 2));
  }
});
