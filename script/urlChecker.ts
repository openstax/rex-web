import { JSDOM } from 'jsdom';
import chunk from 'lodash/chunk';
import fetch from 'node-fetch';
import { argv } from 'yargs';
import { Redirects } from '../data/redirects/types';
import { content as contentRoute } from '../src/app/content/routes';
import { Book, BookWithOSWebData, LinkedArchiveTreeSection } from '../src/app/content/types';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams, getUrlParamForPageId } from '../src/app/content/utils/urlUtils';
import { assertDefined } from '../src/app/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import { findBooks } from './utils/bookUtils';
import getPageOrRedirectedUrl from './utils/getPageOrRedirectedUrl';
import prepareRedirects from './utils/prepareRedirects';
import progressBar from './utils/progressBar';

(global as any).DOMParser = new JSDOM().window.DOMParser;

const {
  rootUrl,
  bookId,
  bookVersion,
  archiveUrl,
  useUnversionedUrls,
} = argv as {
  rootUrl?: string;
  bookId?: string;
  bookVersion?: string;
  archiveUrl?: string;
  useUnversionedUrls?: boolean;
};

async function checkPages(bookSlug: string, pages: string[], redirects: Redirects) {
  let anyFailures = false;
  const bar = progressBar(`checking ${bookSlug} [:bar] :current/:total (:etas ETA)`, {
    complete: '=',
    incomplete: ' ',
    total: pages.length,
    width: 20,
  });

  const notFound: string[] = [];

  const visitPage = async(page: string) => {
    const validatedUrl = getPageOrRedirectedUrl(redirects, page);
    try {
      const response = await fetch(`${rootUrl}${validatedUrl}`);
      if (response.status === 404) {
        notFound.push(page);
      }
    } catch {
      anyFailures = true;
      bar.interrupt(`- (error loading) ${page}`);
    }

    bar.tick();
  };

  for (const pageChunk of chunk(pages, 50)) {
    await Promise.all(pageChunk.map(visitPage));
  }

   // tslint:disable-next-line:no-console
  console.log(`checked ${pages.length} pages, found ${notFound.length} 404s`);

  if (notFound.length) {
    console.log(`404'd: ${notFound.length === pages.length // tslint:disable-line:no-console
      ? 'all'
      : `\n${notFound.join('\n')}\n`}`);
  }

  return anyFailures || notFound.length > 0;
}

const getUrl = (book: Book) => useUnversionedUrls
  ? (treeSection: LinkedArchiveTreeSection) =>
      contentRoute.getUrl({
        book: {
          slug: (book as BookWithOSWebData).slug,
        },
        page: getUrlParamForPageId(book, treeSection.id),
      })
  : (treeSection: LinkedArchiveTreeSection) => getBookPageUrlAndParams(book, treeSection).url;

async function checkUrls() {
  const archiveLoader = createArchiveLoader(`${archiveUrl ? archiveUrl : rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);
  const url = assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port');
  const books = await findBooks({
    archiveLoader,
    bookId,
    bookVersion,
    osWebLoader,
    rootUrl: url,
  });
  const redirects = await prepareRedirects(archiveLoader, osWebLoader);

  let anyFailures = false;

  for (const book of books) {
    const pages = findTreePages(book.tree);
    anyFailures = await checkPages(book.slug, pages.map(getUrl(book)), redirects) || anyFailures;
  }

  if (anyFailures) {
    process.exit(1);
  }
}

checkUrls().catch((err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});
