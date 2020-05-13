import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { argv } from 'yargs';
import { assertDefined } from '../src/app/utils';
import { findBookPages, findBooks } from './utils/bookUtils';

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

async function checkUrl() {
  const books = await findBooks({
    archiveUrl,
    bookId,
    bookVersion,
    rootUrl: assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port'),
  });

  for (const book of books) {
    await checkPages(book.slug, findBookPages(book));
  }
}

checkUrl().catch((err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});
