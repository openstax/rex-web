// tslint:disable: no-console
import fs from 'fs';
import { isString } from 'lodash';
import path from 'path';
import ProgressBar from 'progress';
import argv from 'yargs';
import { BookWithOSWebData } from '../src/app/content/types';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import ArchiveUrlConfig from '../src/config.archive-url';
import BOOKS_CONFIG from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import processBookVersionUpdate, { SimpleBook } from './update-content-versions-and-check-for-archived-slugs';
import updateRedirectsData from './utils/update-redirects-data';

const configArchiveUrlPath = path.resolve(__dirname, '../src/config.archive-url.json');
const { REACT_APP_ARCHIVE_URL_BASE } = ArchiveUrlConfig;

const args = argv.string('newArchive').argv as any as {
  newArchive: string,
  contentVersion: string | string[],
};

const getBooksToUpdate = (books: string[]) => books.map((book) => {
  const bookId = book.split('@')[0];
  const versionNumber = book.split('@')[1].toString();
  const { defaultVersion } = BOOKS_CONFIG[parseInt(bookId, 10)] || {};
  return defaultVersion === versionNumber ? null : {bookId, versionNumber};
});

async function updateArchiveAndContentVersions() {
  const booksReceived = args.contentVersion
    ? (isString(args.contentVersion)  ? [args.contentVersion] : args.contentVersion)
    : [];
  const booksToUpdate = booksReceived.length
    ? getBooksToUpdate(booksReceived).filter((book): book is SimpleBook => !!book)
    : [];

  if (args.newArchive === REACT_APP_ARCHIVE && !booksToUpdate.length) {
    console.log('Current and new archive url are the same. No books need version updates. Skipping...');
    return;
  } else if (args.newArchive === REACT_APP_ARCHIVE && booksToUpdate.length) {
    console.log('Current and new archive url are the same. Processing content version updates...');
    for (const book of booksToUpdate) {
      await processBookVersionUpdate(book);
    }
    return;
  } else if (!booksToUpdate.length) {
    console.log('No books need version updates. Updating archive version...');
  }

  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  const currentBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(REACT_APP_ARCHIVE_URL, {
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader
  );

  const newBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(`${REACT_APP_ARCHIVE_URL_BASE}${args.newArchive}`, {
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader
  );

  const updateRedirectsPromises: Array<() => Promise<[BookWithOSWebData, number]>> = [];
  for (const book of booksToUpdate) {
    await processBookVersionUpdate(book, `${REACT_APP_ARCHIVE_URL_BASE}${args.newArchive}`);
  }
  const bookEntries = Object.entries(BOOKS_CONFIG);

  console.log('Preparing redirects...');
  for (const [entryId, { defaultVersion }] of bookEntries) {
    const bookToUpdate = booksToUpdate.find((book) => book.bookId === entryId);

    updateRedirectsPromises.push(async() => {
      const [currentBook, newBook] = await Promise.all([
        currentBookLoader(entryId, defaultVersion),
        newBookLoader(entryId, bookToUpdate ? bookToUpdate.versionNumber : defaultVersion),
      ]);

      const redirects = await updateRedirectsData(currentBook, newBook);

      return [currentBook, redirects];
    });
  }

  const newRedirects: Array<[BookWithOSWebData, number]> = [];

  const updatingRedirectsBar = new ProgressBar(
    'Updating redirects [:bar] :current/:total (:etas ETA)',
    { complete: '=', incomplete: ' ', total: bookEntries.length }
  );
  await Promise.all(updateRedirectsPromises.map((loader) => {
    return loader()
      .then(([book, redirects]) => {
        updatingRedirectsBar.interrupt(`Finished processing ${book.title} | ${book.id}`);
        updatingRedirectsBar.tick();
        if (redirects > 0) {
          newRedirects.push([book, redirects]);
        }
      });
  }));

  // New line after progress bar
  console.log('');

  if (newRedirects.length > 0) {
    console.log(
      newRedirects
        .map(([book, redirects]) => `Added ${redirects} redirects for book ${book.title} | ${book.id}`)
        .join('\n')
    );
  } else {
    console.log('No new redirects were added.');
  }

  const newConfig: typeof ArchiveUrlConfig = {
    REACT_APP_ARCHIVE: args.newArchive,
    REACT_APP_ARCHIVE_URL_BASE,
  };

  console.log(`Updating config.archive-url.json with ${args.newArchive}`);

  fs.writeFileSync(configArchiveUrlPath, JSON.stringify(newConfig, undefined, 2) + '\n', 'utf8');
}

updateArchiveAndContentVersions()
  .catch(() => {
    process.exit(1);
  });
