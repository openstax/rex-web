// tslint:disable: no-console
import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
import argv from 'yargs';
import { BookWithOSWebData } from '../src/app/content/types';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { isDefined } from '../src/app/guards';
import { ARCHIVE_URL, REACT_APP_ARCHIVE, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import ArchiveUrlConfig from '../src/config.archive-url';
import BOOKS_CONFIG from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import updateRedirectsData from './utils/update-redirects-data';

const configArchiveUrlPath = path.resolve(__dirname, '../src/config.archive-url.json');
const booksPath = path.resolve(__dirname, '../src/config.books.json');
const { REACT_APP_ARCHIVE_URL_BASE } = ArchiveUrlConfig;

const args = argv.string('pipelineVersion').argv as any as {
  pipelineVersion: string,
  contentVersion: string | string[],
};

const getBooksToUpdate = (books: string[]) => books.map((book) => {
  const bookId = book.split('@')[0];
  const versionNumber = book.split('@')[1];
  const { defaultVersion } = BOOKS_CONFIG[bookId] || {};
  return defaultVersion === versionNumber
    ? undefined
    : [bookId, {defaultVersion: versionNumber}] as [string, {defaultVersion: string}];
});

async function updateArchiveAndContentVersions() {
  const updatePipeline = args.pipelineVersion && args.pipelineVersion !== REACT_APP_ARCHIVE;
  const newArchiveUrl = updatePipeline ? `${REACT_APP_ARCHIVE_URL_BASE}${args.pipelineVersion}` : REACT_APP_ARCHIVE_URL;
  const booksReceived = args.contentVersion
    ? (typeof args.contentVersion === 'string' ? [args.contentVersion] : args.contentVersion)
    : [];
  const booksToUpdate = booksReceived.length ? getBooksToUpdate(booksReceived).filter(isDefined) : [];

  if (!updatePipeline && !booksToUpdate.length) {
    console.log('Current and new archive url are the same. No books need version updates. Skipping...');
    return;
  }

  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  const currentBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(REACT_APP_ARCHIVE_URL, {
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader
  );

  const newBookLoader = makeUnifiedBookLoader(
    createArchiveLoader(newArchiveUrl, {
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader
  );

  const updateRedirectsPromises: Array<() => Promise<[BookWithOSWebData, number]>> = [];

  console.log('Preparing books...');
  for (const book of booksToUpdate) {
    const updatedBooksConfig = { ...BOOKS_CONFIG };
    updatedBooksConfig[book[0]] = { defaultVersion: book[1].defaultVersion };
    fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');
  }

  const bookEntries = updatePipeline ? Object.entries(BOOKS_CONFIG) : booksToUpdate;

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

  if (!updatePipeline) {
    console.log('Current and new archive url are the same. Skipping archive update...');
    return;
  }

  const newConfig: typeof ArchiveUrlConfig = {
    REACT_APP_ARCHIVE: args.pipelineVersion,
    REACT_APP_ARCHIVE_URL_BASE,
  };

  console.log(`Updating config.archive-url.json with ${args.pipelineVersion}`);

  fs.writeFileSync(configArchiveUrlPath, JSON.stringify(newConfig, undefined, 2) + '\n', 'utf8');
}

updateArchiveAndContentVersions()
  .catch(() => {
    console.log('an error has prevented the upgrade from completing');
    process.exit(1);
  });
