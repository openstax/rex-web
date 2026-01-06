import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
import argv from 'yargs';
import { BookWithOSWebData } from '../src/app/content/types';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { isDefined } from '../src/app/guards';
import { tuple } from '../src/app/utils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE, REACT_APP_OS_WEB_API_URL } from '../src/config';
import ArchiveUrlConfig from '../src/config.archive-url';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import { BooksConfig, getBooksConfigSync } from '../src/gateways/createBookConfigLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import updateRedirectsData from './utils/update-redirects-data';

const configArchiveUrlPath = path.resolve(__dirname, '../src/config.archive-url.json');
const booksPath = path.resolve(__dirname, '../src/config.books.json');
const { REACT_APP_ARCHIVE_URL_BASE } = ArchiveUrlConfig;

const args = argv.string('pipelineVersion').argv as any as {
  pipelineVersion: string,
  contentVersion: string | string[],
};

const getBooksToUpdate = (books: string[], config: BooksConfig) => books.map((book) => {
  const [bookId, contentVersion] = book.split('@');
  const { defaultVersion, archiveOverride, dynamicStyles } = config.books[bookId] || {};
  // include only books with a version change or where there is an existing pinned pipeline
  return defaultVersion === contentVersion && !archiveOverride
    ? undefined
    : tuple(bookId, {contentVersion, dynamicStyles});
});

async function updateArchiveAndContentVersions() {
  const booksConfig = getBooksConfigSync();
  const newArchiveVersion = args.pipelineVersion && args.pipelineVersion !== REACT_APP_ARCHIVE
    ? args.pipelineVersion
    : undefined;
  const booksReceived = args.contentVersion
    ? (typeof args.contentVersion === 'string' ? [args.contentVersion] : args.contentVersion)
    : [];
  const booksToUpdate = booksReceived.length
    ? getBooksToUpdate(booksReceived, booksConfig).filter(isDefined)
    : [];

  if (!newArchiveVersion && !booksToUpdate.length) {
    console.log('Current and new archive url are the same. No books need version updates.');
    process.exit(1);

  }

  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  const currentBookLoader = makeUnifiedBookLoader(
    createArchiveLoader({
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader,
    {booksConfig}
  );

  const updateRedirectsPromises: Array<() => Promise<[BookWithOSWebData, number]>> = [];

  console.log('Preparing books...');
  const updatedBooksConfig = { ...booksConfig.books };

  for (const book of booksToUpdate) {
    const [bookId, bookConfig] = book;
    const {contentVersion, dynamicStyles} = bookConfig;
    // this will remove any archiveOverride the book currently has
    updatedBooksConfig[bookId] = {defaultVersion: contentVersion, dynamicStyles};
    fs.writeFileSync(booksPath, JSON.stringify(updatedBooksConfig, undefined, 2) + '\n', 'utf8');
  }

  const newBookLoader = makeUnifiedBookLoader(
    createArchiveLoader({
      archivePrefix: ARCHIVE_URL,
    }),
    osWebLoader,
    {booksConfig: {...booksConfig, books: updatedBooksConfig}}
  );

  const bookEntries = newArchiveVersion
    // updating pipeline, check redirects for every book that is not retired
    ? Object.entries(booksConfig.books).filter(([, book]) => !book.retired)
    // updating content, check redirects for updated books (not new books)
    : booksToUpdate.filter(([bookId]) => !!booksConfig.books[bookId])
  ;

  for (const [bookId] of bookEntries) {
    const bookHasContentUpdate = booksToUpdate.find((book) => book[0] === bookId);
    // ignore books with a pinned archive that have no content updates
    if (bookHasContentUpdate || !booksConfig.books[bookId].archiveOverride) {
      updateRedirectsPromises.push(async() => {
        const [currentBook, newBook] = await Promise.all([
          currentBookLoader(bookId),
          newBookLoader(bookId),
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

  if (!newArchiveVersion) {
    console.log('Current and new archive url are the same. Skipping archive update...');
    return;
  }

  const newConfig: typeof ArchiveUrlConfig = {
    REACT_APP_ARCHIVE: newArchiveVersion,
    REACT_APP_ARCHIVE_URL_BASE,
  };

  console.log(`Updating config.archive-url.json with ${newArchiveVersion}`);

  fs.writeFileSync(configArchiveUrlPath, JSON.stringify(newConfig, undefined, 2) + '\n', 'utf8');
}

updateArchiveAndContentVersions()
  .catch((e) => {
    console.error('an error has prevented the upgrade from completing', e);
    process.exit(1);
  });
