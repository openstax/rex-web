import fs from 'fs';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import path from 'path';
import { basename } from 'path';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';
import { argv } from 'yargs';
import { Book } from '../src/app/content/types';
import { getBookPageUrlAndParams, makeUnifiedBookLoader } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { assertDefined } from '../src/app/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

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

assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port');

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
  let anyFailures = false;
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
        anyFailures = true;
        bar.interrupt(`- (${matches.length}) ${basename(pageUrl)}#${matches[0]}`);
      }
    } catch (e) {
      anyFailures = true;
      bar.interrupt(`- (error loading) ${basename(pageUrl)}`);
    }

    bar.tick();
  }

  return anyFailures;
}

async function run() {
  const audit = (await import(auditPath)).default;
  const browser = await puppeteer.launch({
    devtools: devTools,
  });
  const books = await findBooks();
  let anyFailures = false;

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60 * 1000);

  for (const book of books) {
    anyFailures = await visitPages(page, findBookPages(book), audit) || anyFailures;
  }

  await browser.close();

  if (anyFailures) {
    process.exit(1);
  }
}

run().then(null, (err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});

async function findBooks() {
  // Get the book config whether the server is prerendered or dev mode
  const bookConfig: typeof config.BOOKS = await fetch(`${rootUrl}/rex/release.json`)
    .then((response) => response.json())
    .then((json) => json.books)
    .catch(() => config.BOOKS)
  ;

  (global as any).fetch = fetch;
  const archiveLoader = createArchiveLoader(`${archiveUrl ? archiveUrl : rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const bookInfo = bookId
    ? [{id: bookId, version: bookVersion || assertDefined(bookConfig[bookId], '').defaultVersion}]
    : Object.entries(bookConfig).map(([id, {defaultVersion}]) => ({id, version: defaultVersion}))
  ;

  return await Promise.all(bookInfo.map(({id, version}) => bookLoader(id, version)));
}

function findBookPages(book: Book) {
  const pages = findTreePages(book.tree);
  return pages.map((treeSection) => getBookPageUrlAndParams(book, treeSection).url);
}
