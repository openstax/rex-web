import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { argv } from 'yargs';
import { content as contentRoute } from '../src/app/content/routes';
import { Book, BookWithOSWebData, LinkedArchiveTreeSection } from '../src/app/content/types';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams, getUrlParamForPageId } from '../src/app/content/utils/urlUtils';
import { assertDefined } from '../src/app/utils';
import { findBooks } from './utils/bookUtils';

const {
  rootUrl,
  bookId,
  bookVersion,
  archiveUrl,
} = argv as {
  rootUrl?: string;
  bookId?: string;
  bookVersion?: string;
  archiveUrl?: string;
};

async function checkPages(bookSlug: string, pages: string[]) {
  const bar = new ProgressBar(`checking ${bookSlug} [:bar] :current/:total (:etas ETA)`, {
    complete: '=',
    incomplete: ' ',
    total: pages.length,
    width: 20,
  });

  const notFound: string[] = [];

  for (const pageUrl of pages) {
    try {
      const response = await fetch(`${rootUrl}${pageUrl}`);
      if (response.status === 404) {
        notFound.push(pageUrl);
      }
    } catch (e) {
      bar.interrupt(`- (error loading) ${pageUrl}`);
    }

    bar.tick();
  }

  if (notFound.length) {
    console.log(`404'd: ${notFound.length === pages.length // tslint:disable-line:no-console
      ? 'all'
      : `\n${notFound.join('\n')}\n`}`);
  }
}

const getUrl = (book: Book, isProduction: boolean) => isProduction
  ? (treeSection: LinkedArchiveTreeSection) =>
      contentRoute.getUrl({
        book: {
          slug: (book as BookWithOSWebData).slug,
        },
        page: getUrlParamForPageId(book, treeSection.shortId),
      })
  : (treeSection: LinkedArchiveTreeSection) => getBookPageUrlAndParams(book, treeSection).url;

async function checkUrls() {
  const url = assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port');
  const books = await findBooks({
    archiveUrl,
    bookId,
    bookVersion,
    rootUrl: url,
  });
  const isProduction = !/release-\d+/g.test(url);

  for (const book of books) {
    const pages = findTreePages(book.tree);
    await checkPages(book.slug, pages.map(getUrl(book, isProduction)));
  }
}

checkUrls().catch((err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});
