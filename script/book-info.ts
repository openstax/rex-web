import fetch from 'node-fetch';
import { argv } from 'yargs';
import { ARCHIVE_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import { getBooksConfigSync } from '../src/gateways/createBookConfigLoader';

const {
  field,
} = argv as {
  field?: string;
};

(global as any).fetch = fetch;

const archiveLoader = createArchiveLoader({
  archivePrefix: ARCHIVE_URL,
});

const bookId = argv._[1];
const booksConfig = getBooksConfigSync();
archiveLoader.book(bookId, {booksConfig}).load().then((book: any) => {
  if (field) {
    // tslint:disable-next-line:no-console
    console.log(book[field]);
  } else {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(book, null, 2));
  }
});
