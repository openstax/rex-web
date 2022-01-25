// tslint:disable: no-console
import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
import { argv } from 'yargs';
import { BookWithOSWebData } from '../src/app/content/types';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import ArchiveUrlConfig from '../src/config.archive-url';
import BOOKS_CONFIG from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import processBook, { NewBookVersion } from './update-content-versions-and-check-for-archived-slugs';
import updateRedirectsData from './utils/update-redirects-data';

const configArchiveUrlPath = path.resolve(__dirname, '../src/config.archive-url.json');
const { REACT_APP_ARCHIVE_URL_BASE } = ArchiveUrlConfig;

const args = argv as any as {
  newArchive: string,
  contentVersion: string[],
};

const newBookVersions = (books: string[]) => books.map((book) => {
  const bookId = book.split('@')[0];
  const versionNumber = book.split('@')[1].toString();
  const { defaultVersion } = BOOKS_CONFIG[parseInt(bookId, 10)] || {};
  return defaultVersion === versionNumber ? null : {bookId, versionNumber};
});

async function updateArchiveVersion() {
  const bookList = newBookVersions(args.contentVersion).filter((book): book is NewBookVersion => !!book);

  if (args.newArchive === REACT_APP_ARCHIVE && !bookList.length) {
    console.log('Current and new archive url are the same. Content already at desired versions. Skipping...');
    return;
  } else if (args.newArchive === REACT_APP_ARCHIVE && bookList.length) {
    console.log('Current and new archive url are the same. Processing content version updates...');
    for (const book of bookList) {
      await processBook(book);
    }
    return;
  } else if (!bookList.length) {
    console.log('Content already at desired versions. Updating archive version...');
  }

  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  const currentBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(REACT_APP_ARCHIVE_URL, {
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader
  );

  const newBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(args.newArchive, {
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader
  );

  const updateRedirectsPromises: Array<() => Promise<[BookWithOSWebData, number]>> = [];
  const bookEntries = Object.entries(BOOKS_CONFIG);

  console.log('Preparing books...');

  for (const [bookId, { defaultVersion }] of bookEntries) {
    updateRedirectsPromises.push(async() => {
      const [currentBook, newBook] = await Promise.all([
        currentBookLoader(bookId, defaultVersion),
        newBookLoader(bookId, defaultVersion),
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

updateArchiveVersion()
  .catch(() => {
    console.log('an error has prevented the upgrade from completing');
    process.exit(1);
  });
