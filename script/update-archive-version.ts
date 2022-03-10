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
  const { defaultVersion, archiveOverride } = BOOKS_CONFIG[bookId] || {};
  // include only books with a version change or where there is an existing pinned pipeline
  return defaultVersion === versionNumber && !archiveOverride
    ? undefined
    : [bookId, {defaultVersion: versionNumber}] as [string, {defaultVersion: string, archiveOverride?: string}];
});

async function updateArchiveAndContentVersions() {
  const updatePipeline = args.pipelineVersion && args.pipelineVersion !== REACT_APP_ARCHIVE;
  const newArchiveUrl = updatePipeline ? `${REACT_APP_ARCHIVE_URL_BASE}${args.pipelineVersion}` : REACT_APP_ARCHIVE_URL;
  const booksReceived = args.contentVersion
    ? (typeof args.contentVersion === 'string' ? [args.contentVersion] : args.contentVersion)
    : [];
  const booksToUpdate = booksReceived.length ? getBooksToUpdate(booksReceived).filter(isDefined) : [];

  if (!updatePipeline && !booksToUpdate.length) {
    console.log('Current and new archive url are the same. No books need version updates.');
    process.exit(1);

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
      disablePerBookPinning: true,
    }),
    osWebLoader
  );

  const updateRedirectsPromises: Array<() => Promise<[BookWithOSWebData, number]>> = [];

  console.log('Preparing books...');
  const updatedBooksConfig = { ...BOOKS_CONFIG };

  for (const book of booksToUpdate) {
    const [bookId, bookVersion] = book;
    updatedBooksConfig[bookId] = bookVersion;
    fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');
  }

  const bookEntries = updatePipeline
    // updating pipeline, check redirects for every book
    ? Object.entries(BOOKS_CONFIG)
    // updating content, check redirects for updated books (not new books)
    : booksToUpdate.filter(([bookId]) => !!BOOKS_CONFIG[bookId])
  ;

  for (const [bookId] of bookEntries) {
    const bookHasContentUpdate = booksToUpdate.find((book) => book[0] === bookId);
    // ignore books with a pinned archive that have no content updates
    if (bookHasContentUpdate || !BOOKS_CONFIG[bookId].archiveOverride) {
      updateRedirectsPromises.push(async() => {
        const [currentBook, newBook] = await Promise.all([
          currentBookLoader(bookId, BOOKS_CONFIG[bookId].defaultVersion),
          newBookLoader(bookId, bookHasContentUpdate
            ? bookHasContentUpdate[1].defaultVersion
            : BOOKS_CONFIG[bookId].defaultVersion
          ),
        ]);

        const redirects = await updateRedirectsData(currentBook, newBook);

        return [currentBook, redirects];
      });
    }
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
  .catch((e) => {
    console.error('an error has prevented the upgrade from completing', e);
    process.exit(1);
  });
