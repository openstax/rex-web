import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';
import { basename } from 'path';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';
import { argv } from 'yargs';
import { Book } from '../src/app/content/types';
import { getBookPageUrlAndParams } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { assertDefined } from '../src/app/utils';
import { findBooks } from './utils/bookUtils';

(global as any).DOMParser = new JSDOM().window.DOMParser;

const {
  rootUrl,
  bookId,
  bookVersion,
  queryString,
  archiveUrl,
} = argv as {
  rootUrl?: string;
  bookId?: string;
  bookVersion?: string;
  queryString?: string;
  archiveUrl?: string;
};

const devTools = false;
const auditName = argv._[1];
const auditPath = `./audits/${auditName}`;

if (!auditName) {
  throw new Error(`audit name is required`);
}
if (!fs.existsSync(path.resolve(__dirname, `${auditPath}.ts`))) {
  throw new Error(`audit ${auditName} doesn't exist`);
}

export type Audit = () => string[];

const calmHooks = (target: puppeteer.Page) => target.evaluate(() => {
  if (window && window.__APP_ASYNC_HOOKS) {
    return window.__APP_ASYNC_HOOKS.calm();
  }
});

async function visitPages(page: puppeteer.Page, bookPages: string[], audit: Audit) {
  const bar = new ProgressBar('visiting [:bar] :current/:total (:etas ETA) ', {
    complete: '=',
    incomplete: ' ',
    total: bookPages.length,
  });

  for (const pageUrl of bookPages) {
    try {
      const appendQueryString =
        queryString ? (archiveUrl ? `?archive=${archiveUrl}&${queryString}` : `?${queryString}`)
                    : archiveUrl ? `?archive=${archiveUrl}` : '';
      await page.goto(`${rootUrl}${pageUrl}${appendQueryString}`);
      await page.waitForSelector('body[data-rex-loaded="true"]');
      await calmHooks(page);

      const matches = await page.evaluate(audit);

      if (matches.length > 0) {
        bar.interrupt(`- (${matches.length}) ${basename(pageUrl)}#${matches[0]}`);
      }
    } catch (e) {
      bar.interrupt(`- (error loading) ${basename(pageUrl)}`);
    }

    bar.tick();
  }
}

async function run() {
  const audit = (await import(auditPath)).default;
  const browser = await puppeteer.launch({
    devtools: devTools,
  });
  const books = await findBooks({
    archiveUrl,
    bookId,
    bookVersion,
    rootUrl: assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port'),
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60 * 1000);

  for (const book of books) {
    await visitPages(page, findBookPages(book), audit);
  }

  await browser.close();
}

run().then(null, (err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});

export function findBookPages(book: Book) {
  const pages = findTreePages(book.tree);
  return pages.map((treeSection) => getBookPageUrlAndParams(book, treeSection).url);
}
