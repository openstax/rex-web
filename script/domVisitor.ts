import * as dom from '@openstax/types/lib.dom';
import fetch from 'node-fetch';
import { basename } from 'path';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';
import { Book } from '../src/app/content/types';
import { flattenArchiveTree, getBookPageUrlAndParams } from '../src/app/content/utils';
import { getBooks } from '../src/app/developer/components/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

const port = process.env.PORT || '8000';
const rootUrl = `http://localhost:${port}`;
const devTools = false;
const onlyOneBook = process.argv[3]; // because it's being called via entry.js

function browserFindMatches(): string[] {
  // Note: This executes in the browser context
  if (!document) {
    throw new Error(`BUG: Should run in browser context`);
  }
  function nearestId(el: dom.Element): string {
    const id = el.getAttribute('id');
    if (id) {
      return id;
    } else if (el.parentElement) {
      return nearestId(el.parentElement);
    }
    throw new Error('BUG: Could not find an ancestor with an id');
  }

  // Remove all the MJX_Assistive_MathML elements because they
  // can be wider even though they are not visible
  document.querySelectorAll('.MJX_Assistive_MathML').forEach((el) => el.remove());

  const wideIds = new Set<string>();
  const root = document.querySelector('#main-content > div');
  if (!root) {
    throw new Error(`BUG: Could not find content root`);
  }
  const rootRight = root.getBoundingClientRect().right;
  root.querySelectorAll('*').forEach((c) => {
    if (c.getBoundingClientRect().right > rootRight) {
      wideIds.add(nearestId(c));
    }
  });
  return Array.from(wideIds);
}

async function visitPages(page: puppeteer.Page, bookPages: string[]) {
  const bar = new ProgressBar('visiting [:bar] :current/:total (:etas ETA) ', {
    complete: '=',
    incomplete: ' ',
    total: bookPages.length,
  });

  for (const pageUrl of bookPages) {

    await page.goto(`${rootUrl}${pageUrl}`);
    await page.waitForSelector('body[data-rex-loaded="true"]');

    const matches = await page.evaluate(browserFindMatches);
    if (matches.length > 0) {
      bar.interrupt(`- (${matches.length}) ${basename(pageUrl)}#${matches[0]}`);
    }
    bar.tick();
  }
}

async function run() {
  const browser = await puppeteer.launch({
    devtools: devTools,
  });
  const books = await findBooks();

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60 * 1000);

  for (const book of books) {
    await visitPages(page, findBookPages(book));
  }

  await browser.close();

  if (books.length === 0) {
    // tslint:disable-next-line:no-console
    console.error(`Could not find a matching book. ${onlyOneBook ? 'Check that the slug name is correct' : ''}`);
    process.exit(1);
  }
}

run().then(null, (err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});

async function findBooks() {
  // Get the book config whether the server is prerendered or dev mode
  const resp = await fetch(`${rootUrl}/rex/release.json`);
  let bookConfig;
  // dev server also returns a 200 but says 'not found'
  try {
    bookConfig = (await resp.json()).books;
  } catch {
    bookConfig = config.BOOKS;
  }
  (global as any).fetch = fetch;
  const archiveLoader = createArchiveLoader(`${rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);

  const books = await getBooks(archiveLoader, osWebLoader, Object.entries(bookConfig));
  return books.filter((book) => onlyOneBook ? book.slug === onlyOneBook : true);
}

function findBookPages(book: Book) {
  const pages = flattenArchiveTree(book.tree);
  return pages.map((treeSection) => getBookPageUrlAndParams(book, treeSection).url);
}
