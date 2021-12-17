import fetch from 'node-fetch';
import { argv } from 'yargs';
import { makeUnifiedBookLoader } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { stripIdVersion } from '../src/app/content/utils/idUtils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import BOOKS from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

(global as any).fetch = fetch;

const bookId = argv._[1];
const bookVersion = BOOKS[bookId].defaultVersion;

const archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
  archivePrefix: ARCHIVE_URL,
});
const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);
const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

const getBookMetadata = async(id: string, version: string) => {
  const book = await bookLoader(id, version);

  process.stdout.write(JSON.stringify(
    findTreePages(book.tree)
      .map((page) => ({
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: page.slug,
          },
        },
        state: {
          bookUid: book.id,
          bookVersion: book.version,
          pageUid: stripIdVersion(page.id),
        },
      }))
  ));
};

getBookMetadata(bookId, bookVersion);
