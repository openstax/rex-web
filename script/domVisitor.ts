// tslint:disable:no-console
import * as dom from '@openstax/types/lib.dom';
import { dirname } from 'path';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';

const rootUrl = `http://localhost:${process.env.PORT || '8000'}`;
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

async function visitPages(page: puppeteer.Page, bookHref: string) {
  const bookPages = await findBookPages(page, bookHref);
  const bar = new ProgressBar('visiting [:bar] :current/:total (:etas ETA) ', {
    complete: '=',
    incomplete: ' ',
    total: bookPages.length,
  });

  for (const bookPageUrl of bookPages) {
    const pageUrl = `${dirname(bookHref)}/${bookPageUrl}`;

    await page.goto(`${rootUrl}/${pageUrl}`);
    await page.waitForSelector('body[data-rex-loaded="true"]');

    const matches = await page.evaluate(browserFindMatches);
    if (matches.length > 0) {
      bar.interrupt(`- (${matches.length}) ${pageUrl}#${matches[0]}`);
    }
    bar.tick();
  }
}

async function run() {
  const browser = await puppeteer.launch({
    devtools: devTools,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60 * 1000);

  const books = await findBooks(page);

  for (const book of books) {
    await visitPages(page, book.href);
  }

  await browser.close();

  if (books.length === 0) {
    console.error(`Could not find a matching book. ${onlyOneBook ? 'Check that the slug name is correct' : ''}`);
    process.exit(1);
  }
}

run().then(null, (err) => {
  console.error(err);
  process.exit(1);
});

async function findBooks(page: puppeteer.Page) {
  await page.goto(rootUrl);
  await page.waitForSelector('a[data-slug]');
  const books: Array<{slug: string, href: string}> = await page.evaluate(() => {
    // Note: This runs in the browser
    if (document) {
      return Array.from(document.querySelectorAll('a[data-slug]')).map((el) => {
        return {
          href: el.getAttribute('href'),
          slug: el.getAttribute('data-slug'),
        };
      });
    } else {
      throw new Error('BUG: Could not find document');
    }
  });

  return books.filter(({slug}) => onlyOneBook ? slug === onlyOneBook : true);
}

async function findBookPages(page: puppeteer.Page, bookHref: string) {
  await page.goto(`${rootUrl}/${bookHref}`);

  // Extract the ToC
  await page.waitForSelector('[aria-label="Table of Contents"]');
  const bookPages: string[] = await page.evaluate(() => {
    if (document) {
      return Array.from(document.querySelectorAll('[aria-label="Table of Contents"] a[href]'))
      .map((el) => el.getAttribute('href'));
    }
  });
  return bookPages;
}
