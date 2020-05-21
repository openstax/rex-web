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
  useUnversionedUrls,
} = argv as {
  rootUrl?: string;
  bookId?: string;
  bookVersion?: string;
  archiveUrl?: string;
  useUnversionedUrls?: boolean;
};

const chunkArray = <T>(array: T[], max: number) =>
  Array.from({length: Math.ceil(array.length / max)}, (_, i) => array.slice(i * max, (i + 1) * max));

async function checkPages(bookSlug: string, pages: string[]) {
  let anyFailures = false;
  const bar = new ProgressBar(`checking ${bookSlug} [:bar] :current/:total (:etas ETA)`, {
    complete: '=',
    incomplete: ' ',
    total: pages.length,
    width: 20,
  });

  const notFound: string[] = [];

  const pageChunks = chunkArray(pages, 50);

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

  for (const chunk of pageChunks) {
    await Promise.all(chunk.map(visitPage));
  }

  if (notFound.length) {
    console.log(`404'd: ${notFound.length === pages.length // tslint:disable-line:no-console
      ? 'all'
      : `\n${notFound.join('\n')}\n`}`);
  }

  return anyFailures;
}

const getUrl = (book: Book) => useUnversionedUrls
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

  let anyFailures = false;

  for (const book of books) {
    const pages = findTreePages(book.tree);
    anyFailures = await checkPages(book.slug, pages.map(getUrl(book)));
  }

  if (anyFailures) {
    process.exit(1);
  }
}

checkUrls().catch((err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});
