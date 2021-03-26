// tslint:disable: no-console
import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
import { argv } from 'yargs';
import { BookWithOSWebData } from '../src/app/content/types';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { ARCHIVE_URL, BOOKS, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import ArchiveUrlConfig from '../src/config.archive-url';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import updateRedirectsData from './utils/update-redirects-data';

const configArchiveUrlPath = path.resolve(__dirname, '../src/config.archive-url.json');

const args = argv as any as {
  newArchiveUrl: string
};

async function updateArchiveVersion() {
  if (args.newArchiveUrl === REACT_APP_ARCHIVE_URL) {
    console.log('Current and new archive url are the same. Skipping...');
    return;
  }

  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  const currentBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`),
    osWebLoader
  );

  const newBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(`${ARCHIVE_URL}${args.newArchiveUrl}`),
    osWebLoader
  );

  const updateRedirectsPromises: Array<[string, () => Promise<[BookWithOSWebData, number]>]> = [];
  const bookEntries = Object.entries(BOOKS);

  console.log('Preparing books...');

  for (const [bookId, { defaultVersion }] of bookEntries) {
    updateRedirectsPromises.push([
      bookId,
      async() => {
        const [currentBook, newBook] = await Promise.all([
          currentBookLoader(bookId, defaultVersion),
          newBookLoader(bookId, defaultVersion),
        ]);

        const redirects = await updateRedirectsData(currentBook, newBook);

        return [currentBook, redirects];
      },
    ]);
  }

  const newRedirects: Array<[BookWithOSWebData, number]> = [];

  const updatingRedirectsBar = new ProgressBar(
    'Updating redirects [:bar] :current/:total (:etas ETA) | :msg',
    { complete: '=', incomplete: ' ', total: bookEntries.length }
  );
  await Promise.all(updateRedirectsPromises.map(([bookId, promise]) => {
    return promise()
      .then(([book, redirects]) => {
        updatingRedirectsBar.tick({
          msg: `Finished processing ${book.title} | ${book.id}`,
        });
        if (redirects > 0) {
          newRedirects.push([book, redirects]);
        }
      })
      .catch((error) => {
        updatingRedirectsBar.interrupt(`Error while loading: ${bookId} | ${error}`);
      });
  }));

  // New line after progress bar
  console.log('\n');

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
    REACT_APP_ARCHIVE_URL: args.newArchiveUrl,
  };

  console.log(`Updating config.archive-url.json with ${args.newArchiveUrl}`);

  fs.writeFileSync(configArchiveUrlPath, JSON.stringify(newConfig, undefined, 2) + '\n', 'utf8');
}

updateArchiveVersion();
