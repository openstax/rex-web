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
type ObservePageErrors = (newObserver: PageErrorObserver) => void;

async function visitPages(
  page: puppeteer.Page,
  observePageErrors: ObservePageErrors,
  bookPages: string[],
  audit: Audit
) {
  let anyFailures = false;
  const bar = progressBar('visiting [:bar] :current/:total (:etas ETA) ', {
    complete: '=',
    incomplete: ' ',
    total: bookPages.length,
  });

  observePageErrors((message) => {
    if (quiet !== undefined) {
      bar.interrupt(message);
    }
  });

  for (const pageUrl of bookPages) {
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
        await page.waitForSelector(`${linkSelector}[aria-label="Current Page"]`);
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
    } catch (e: any) {
      anyFailures = true;
      bar.interrupt(`- (error loading) ${pageUrl}`);
      if (e.message) {
        bar.interrupt(e.message);
      }
    }

    bar.tick();
  }

  return anyFailures;
}

function configurePage(page: puppeteer.Page): ObservePageErrors {
  let errorObserver: PageErrorObserver = () => null;
  const cache = new QuickLRU<string, puppeteer.ResponseForRequest>({maxSize: cacheMaxSize});
  let hits = 0;
  let misses = 0;

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

  page.on('request', (request) => {
    const url = request.url();

    if (blockedRequests.some((blockedRequest) => blockedRequest.test(url))) {
      return request.abort();
    }

    if (!url.startsWith('data:')) {
      const cachedResponse = cache.get(url);
      if (cachedResponse) {
        hits++;
        return request.respond(cachedResponse);
      } else {
        misses++;
      }
    }

    request.continue();
  });

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
        // ignore this error that happens if we navigated away from the page before loading this response
        if (error.message !== 'Protocol error (Network.getResponseBody): No resource with given identifier found') {
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

  // tslint:disable-next-line: no-console
  process.on('exit', () => console.log(`Cache hits: ${hits} / Total requests: ${hits + misses}`));

  return (newObserver: PageErrorObserver) => errorObserver = newObserver;
}

async function run() {
  const audit = (await import(auditPath)).default;
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    devtools: devTools,
    headless: showBrowser === undefined,
  });
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

  const page = await browser.newPage();
  const errorDetector = configurePage(page);

  for (const book of books) {
    anyFailures = await visitPages(page, errorDetector, findBookPages(book), audit) || anyFailures;
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

function findBookPages(book: Book) {
  const pages = findTreePages(book.tree);
  return pages.map((treeSection) => getBookPageUrlAndParams(book, treeSection).url);
}
