import { JSDOM } from 'jsdom';
import chunk from 'lodash/chunk';
import fetch from 'node-fetch';
import { argv } from 'yargs';
import { content as contentRoute } from '../src/app/content/routes';
import { Book, BookWithOSWebData, LinkedArchiveTreeSection } from '../src/app/content/types';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams, getUrlParamForPageId } from '../src/app/content/utils/urlUtils';
import { assertDefined } from '../src/app/utils';
import { findBooks } from './utils/bookUtils';
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

async function checkPages(bookSlug: string, pages: string[]) {
  let anyFailures = false;
  const bar = progressBar(`checking ${bookSlug} [:bar] :current/:total (:etas ETA)`, {
    complete: '=',
    incomplete: ' ',
    total: pages.length,
    width: 20,
  });

  const notFound: string[] = [];

  const visitPage = async(page: string) => {
    try {
      const response = await fetch(`${rootUrl}${page}`);
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
  ? async(treeSection: LinkedArchiveTreeSection) =>
      contentRoute.getUrl({
        book: {
          slug: (book as BookWithOSWebData).slug,
        },
        page: getUrlParamForPageId(book, treeSection.id),
      })
  :  async(treeSection: LinkedArchiveTreeSection) =>  (await getBookPageUrlAndParams(book, treeSection)).url;

async function checkUrls() {
  const url = assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port');
  const books = await findBooks({
    archiveUrl,
    bookId,
    bookVersion,
    rootUrl: url,
  });

  let anyFailures = false;

  for (const book of books) {
    const pages = findTreePages(book.tree);
    anyFailures = await checkPages(book.slug, await Promise.all(pages.map(getUrl(book)))) || anyFailures;
  }

  if (anyFailures) {
    process.exit(1);
  }
}

checkUrls().catch((err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});
