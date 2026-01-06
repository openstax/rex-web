import fetch from 'node-fetch';
import { argv } from 'yargs';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import { getBooksConfigSync } from '../src/gateways/createBookConfigLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

const {
  field,
} = argv as {
  field?: string;
};

(global as any).fetch = fetch;

const booksConfig = getBooksConfigSync();

const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);
const bookLoader = makeUnifiedBookLoader(
  createArchiveLoader({
    archivePrefix: ARCHIVE_URL,
  }),
  osWebLoader,
  {booksConfig}
);

const bookId = argv._[1];
bookLoader(bookId).then((book: any) => {
  if (field) {
    console.log(book[field]);
  } else {
    console.log(JSON.stringify(book, null, 2));
  }
});
