import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import querystring from 'querystring';
import QuickLRU from 'quick-lru';
import argv from 'yargs';
import { Book } from '../src/app/content/types';
import { getBookPageUrlAndParams } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { assertDefined } from '../src/app/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import { findBooks } from './utils/bookUtils';
import progressBar from './utils/progressBar';

// Maximum number of retry attempts per page
const maxAttempts = 2;

// Close and re-open tab after this many pages to prevent memory leaks
const closeTabAfter = 30;

// Blocking GTM prevents most analytics scripts from loading
const blockedRequests = [
  /^https?:\/\/(?:www\.)?googletagmanager\.com/,
  /^https?:\/\/js\.pulseinsights\.com/,
  /^https?:\/\/cdn-cookieyes\.com/,
];

// Most pages perform less than 10 requests when GTM is blocked
const cacheMaxSize = 50;

const {
  archiveUrl,
  bookId,
  bookVersion,
  osWebUrl,
  quiet,
  queryString,
  rootUrl,
  showBrowser,
} = argv.string('bookVersion').argv as {
  quiet?: string;
  archiveUrl?: string;
  osWebUrl?: string;
  bookId?: string;
  bookVersion?: string;
  queryString?: string;
  rootUrl?: string;
  showBrowser?: string;
};

const devTools = false;
const auditName = argv.argv._[1];
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

type PageErrorObserver = (message: string) => void;

async function visitPages(
  browser: puppeteer.Browser,
  bookPages: string[],
  audit: Audit
) {
  let anyFailures = false;
  const bar = progressBar('visiting [:bar] :current/:total (:etas ETA) ', {
    complete: '=',
    incomplete: ' ',
    total: bookPages.length,
  });

  let page: puppeteer.Page | undefined;
  let pagesSinceRestart = 0;

  try {
    for (const pageUrl of bookPages) {
      if (pagesSinceRestart >= closeTabAfter) {
        await page?.close();
        page = undefined;
        pagesSinceRestart = 0;
      }

      let attempt = 0;

      while (attempt < maxAttempts) {
        attempt++;

        if (!page) {
          page = await newPage(browser, bar);
        }

        try {
          const queryParams = queryString ? querystring.parse(queryString) : {};
          if (archiveUrl) { queryParams.archive = archiveUrl; }
          if (osWebUrl) { queryParams.osWeb = osWebUrl.replace(/^https?:\/\//i, ''); }
          const qs = querystring.stringify(queryParams);
          const appendQueryString = qs ? `?${qs}` : qs;
          const pageComponents = pageUrl.split('/');
          const slug = pageComponents[pageComponents.length - 1];
          const linkSelector = `a[href^="${slug}"]`;
          const link = await page.$(linkSelector);

          if (link) {
            await page.evaluate((linkCss) => {
              const linkElt = document?.querySelector(linkCss);
              if (!linkElt) {
                // This should not be reachable
                throw new Error('Evaluation failed: document or link not found');
              }

              linkElt.click();
            }, linkSelector);
            await page.waitForSelector(`${linkSelector}[aria-label*="Current Page"]`);
          } else {
            await page.goto(`${rootUrl}${pageUrl}${appendQueryString}`);
          }
          await page.waitForSelector('body[data-rex-loaded="true"]');
          await calmHooks(page);

          const matches = await page.evaluate(audit);

          if (matches.length > 0) {
            anyFailures = true;
            bar.interrupt(`- (${matches.length}) ${pageUrl}#${matches[0]}`);
          }

          const closeOverlayButton = await page.$('button[aria-label="close overlay"]');
          if (closeOverlayButton) {
            await closeOverlayButton.click();
          }

          break;
        } catch (e: any) {
          if (e.message) {
            bar.interrupt(e.message);
          }
          if (attempt < maxAttempts) {
            bar.interrupt(`- (attempt ${attempt} failed - retrying...) ${pageUrl}`);
          } else {
            anyFailures = true;
            bar.interrupt(`- (error loading after ${maxAttempts} attempts) ${pageUrl}`);
          }

          await page?.close();
          page = undefined;
        }
      }

      pagesSinceRestart++;
      bar.tick();
    }
  } finally {
    await page?.close();
  }

  return anyFailures;
}

let hits = 0;
let misses = 0;

// tslint:disable-next-line: no-console
process.on('exit', () => console.log(`Cache hits: ${hits} / Total requests: ${hits + misses}`));

async function newPage(
  browser: puppeteer.Browser,
  bar: ReturnType<typeof progressBar>
): Promise<puppeteer.Page> {
  const cache = new QuickLRU<string, puppeteer.ResponseForRequest>({maxSize: cacheMaxSize});
  const page = await browser.newPage();
  const errorObserver: PageErrorObserver = (message) => {
    if (quiet !== undefined) {
      bar.interrupt(message);
    }
  };

  page.setDefaultNavigationTimeout(60 * 1000);
  page.setRequestInterception(true);

  page.on('console', (message) => {
    if (['info'].includes(message.type())) {
      return;
    }
    if (message.text() === 'Failed to load resource: the server responded with a status of 403 (Forbidden)') {
      return;
    }
    errorObserver(`console: ${message.type().substr(0, 3).toUpperCase()} ${message.text()}`);
  });

  page.on('pageerror', ({ message }) => errorObserver('ERR: ' + message));

  page.on('request', async(request) => {
    try {
      const url = request.url();

      if (blockedRequests.some((blockedRequest) => blockedRequest.test(url))) {
        await request.abort();
        return;
      }

      if (!url.startsWith('data:')) {
        const cachedResponse = cache.get(url);
        if (cachedResponse) {
          hits++;
          await request.respond(cachedResponse);
          return;
        } else {
          misses++;
        }
      }

      await request.continue();
    } catch {
      // request already handled
    }
  });

  const ignoredErrors = [
    'Could not load body for this request. This might happen if the request is a preflight request.',
    'Protocol error (Network.getResponseBody): Target closed.',
  ]

  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();

    // ignore redirect responses since they have no response body
    if (status >= 300 && status < 400) {
      return;
    }

    // don't cache data urls
    if (!url.startsWith('data:')) {
      const headers = response.headers();
      const contentType = headers['content-type'];

      response.buffer().then((body) => cache.set(url, { status, headers, contentType, body })).catch((error) => {
        if (!ignoredErrors.includes(error.message)) {
          throw error;
        }
      });
    }

    if ((status >= 200 && status < 300)) {
      return;
    }

    errorObserver(`response: ${status} ${url}`);
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure();
    const text = failure ? failure.errorText : 'failed';
    if (text === 'net::ERR_ABORTED' && request.url().includes('/resources/')) {
      return;
    }
    errorObserver(`requestfailed: ${text} ${request.url()}`);
  });

  return page;
}

async function run() {
  const audit = (await import(auditPath)).default;
  const archiveLoader = createArchiveLoader({
    archivePrefix: archiveUrl ?? rootUrl,
  });
  const osWebLoader = createOSWebLoader(`${osWebUrl ?? rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);
  const books = await findBooks({
    archiveLoader,
    bookId,
    bookVersion,
    osWebLoader,
    rootUrl: assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port'),
  });

  let anyFailures = false;

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
    ],
    devtools: devTools,
    headless: showBrowser === undefined,
  });

  try {
    for (const book of books) {
      anyFailures = await visitPages(browser, findBookPages(book), audit) || anyFailures;
    }
  } finally {
    await browser.close();
  }

  if (anyFailures) {
    process.exit(1);
  }
}

run().then(null, (err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});

function findBookPages(book: Book) {
  const pages = findTreePages(book.tree);
  return pages.map((treeSection) => getBookPageUrlAndParams(book, treeSection).url);
}
