import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { argv } from 'yargs';
import { Redirects } from '../data/redirects/types';
import { Book } from '../src/app/content/types';
import { getBookPageUrlAndParams } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { assertDefined } from '../src/app/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import { findBooks } from './utils/bookUtils';
import getPageOrRedirectedUrl from './utils/getPageOrRedirectedUrl';
import prepareRedirects from './utils/prepareRedirects';
import progressBar from './utils/progressBar';

const {
  archiveUrl,
  bookId,
  bookVersion,
  quiet,
  queryString,
  rootUrl,
  showBrowser,
} = argv as {
  quiet?: string;
  archiveUrl?: string;
  bookId?: string;
  bookVersion?: string;
  queryString?: string;
  rootUrl?: string;
  showBrowser?: string;
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

type PageErrorObserver = (message: string) => void;
type ObservePageErrors = (newObserver: PageErrorObserver) => void;

async function visitPages(
  page: puppeteer.Page,
  observePageErrors: ObservePageErrors,
  bookPages: string[],
  audit: Audit,
  redirects: Redirects
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
      const appendQueryString =
        queryString ? (archiveUrl ? `?archive=${archiveUrl}&${queryString}` : `?${queryString}`)
                    : archiveUrl ? `?archive=${archiveUrl}` : '';
      const validatedUrl = getPageOrRedirectedUrl(redirects, pageUrl);
      await page.goto(`${rootUrl}${validatedUrl}${appendQueryString}`);
      await page.waitForSelector('body[data-rex-loaded="true"]');
      await calmHooks(page);

      const matches = await page.evaluate(audit);

      if (matches.length > 0) {
        anyFailures = true;
        bar.interrupt(`- (${matches.length}) ${pageUrl}#${matches[0]}`);
      }
    } catch (e) {
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

function makePageErrorDetector(page: puppeteer.Page): ObservePageErrors {
  let observer: PageErrorObserver = () => null;

  page.on('console', (message) => {
    if (['info'].includes(message.type())) {
      return;
    }
    if (message.text() === 'Failed to load resource: the server responded with a status of 403 (Forbidden)') {
      return;
    }
    observer(`console: ${message.type().substr(0, 3).toUpperCase()} ${message.text()}`);
  });

  page.on('pageerror', ({ message }) => observer('ERR: ' + message));

  page.on('response', (response) => {
    if ([200, 304].includes(response.status())) {
      return;
    }
    // accounts endpoint always 403s when logged out
    if (response.status() === 403 && response.url().includes('/accounts/api/user')) {
      return;
    }
    observer(`response: ${response.status()} ${response.url()}`);
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure();
    const text = failure ? failure.errorText : 'failed';
    if (text === 'net::ERR_ABORTED' && request.url().includes('/resources/')) {
      return;
    }
    observer(`requestfailed: ${text} ${request.url()}`);
  });

  return (newObserver: PageErrorObserver) => observer = newObserver;
}

async function run() {
  const audit = (await import(auditPath)).default;
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    devtools: devTools,
    headless: showBrowser === undefined,
  });
  const archiveLoader = createArchiveLoader(`${archiveUrl ? archiveUrl : rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);
  const books = await findBooks({
    archiveLoader,
    bookId,
    bookVersion,
    osWebLoader,
    rootUrl: assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port'),
  });
  const redirects = await prepareRedirects(archiveLoader, osWebLoader);

  let anyFailures = false;

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60 * 1000);

  const errorDetector = makePageErrorDetector(page);

  for (const book of books) {
    anyFailures = await visitPages(page, errorDetector, findBookPages(book), audit, redirects) || anyFailures;
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
