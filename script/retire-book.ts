import fs from 'fs';
import path from 'path';
import argv from 'yargs';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import { getBooksConfigSync } from '../src/gateways/createBookConfigLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import updateRedirectsData from './utils/update-redirects-data';

const booksPath = path.resolve(__dirname, '../src/config.books.json');

const args = argv.string('bookId').argv as any as {
  retiredBook: string,
  redirectBook: string
};

const retireBook = async() => {
  const booksConfig = getBooksConfigSync();
  const {retiredBook, redirectBook} = args;

  if (!retiredBook || !redirectBook) {
    console.error('Missing one or more args. No books were retired.');
    process.exit(1);
  }

  console.log('Preparing to retire book.');
  const updatedBooksConfig = { ...booksConfig.books };

  if (!updatedBooksConfig[retiredBook]) {
    console.log(`Book with id ${retiredBook} not found in config. No books were retired.`);
    process.exit(1);
  } else if (!updatedBooksConfig[redirectBook]) {
    console.log(`Book with id ${redirectBook} not found in config. No books were retired.`);
    process.exit(1);
  }

  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  const bookLoader = makeUnifiedBookLoader(
    createArchiveLoader({
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader,
    {booksConfig}
  );

  const [currentBook, newBook] = await Promise.all([
    bookLoader(retiredBook),
    bookLoader(redirectBook),
  ]);

  const count = await updateRedirectsData(currentBook, newBook, true);
  console.log(`Updated ${count} redirects.`);

  updatedBooksConfig[args.retiredBook].retired = true;
  delete updatedBooksConfig[args.retiredBook].archiveOverride;
  fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');
  console.log('Books config updated.');
};

retireBook()
  .catch((e) => {
    console.error('an error has prevented the upgrade from completing', e);
    process.exit(1);
  });
