// tslint:disable:no-console

/*
  A single worker thread
  Receives messages from work.ts, parses them, renders the pages, uploads them to S3,
  and sends back the entries to be deleted
  This code runs with --unhandled-rejections=strict so unhandled rejections will abort the thread
*/

import './setup';

import { Message } from '@aws-sdk/client-sqs';
import dateFns from 'date-fns';
import Loadable from 'react-loadable';
import { EnumChangefreq } from 'sitemap';
import asyncPool from 'tiny-async-pool';
import { parentPort } from 'worker_threads';
import { ArchiveContent } from '../../src/app/content/types';
import { matchPathname } from '../../src/app/navigation/utils';
import config from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createBookConfigLoader from '../../src/gateways/createBookConfigLoader';
import createBuyPrintConfigLoader from '../../src/gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../../src/gateways/createHighlightClient';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../../src/gateways/createPracticeQuestionsLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import {
  deserializeBook,
  deserializePage,
  makeGetArchiveBook,
  makeGetArchivePage,
  makeRenderPage,
  SerializedBookMatch,
  SerializedPageMatch,
} from './contentPages';
import { writeS3File } from './fileUtils';
import { renderSitemap, renderSitemapIndex, sitemapPath } from './sitemap';

const MAX_CONCURRENT_CONNECTIONS = 5;

type PrerenderPayload = { page: SerializedPageMatch };
type SitemapPayload = { pages: SerializedPageMatch[], slug: string };
type SitemapIndexPayload = { books: SerializedBookMatch[] };

const {
  ACCOUNTS_URL,
  ARCHIVE_URL,
  HIGHLIGHTS_URL,
  OS_WEB_URL,
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_BUY_PRINT_CONFIG_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_SEARCH_URL,
  SEARCH_URL,
} = config;

function getSitemapItemOptions(content: ArchiveContent, url: string) {
  return {
    changefreq: EnumChangefreq.MONTHLY,
    lastmod: dateFns.format(content.revised, 'YYYY-MM-DD'),
    url, // Page URL
  };
}

async function run() {
  console.log('Preloading route components');

  await Loadable.preloadAll();

  const archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
    appPrefix: '',
    archivePrefix: ARCHIVE_URL,
  });
  const osWebLoader = createOSWebLoader(`${OS_WEB_URL}${REACT_APP_OS_WEB_API_URL}`);
  const userLoader = createUserLoader(`${ACCOUNTS_URL}${REACT_APP_ACCOUNTS_URL}`);
  const searchClient = createSearchClient(`${SEARCH_URL}${REACT_APP_SEARCH_URL}`);
  const highlightClient = createHighlightClient(`${HIGHLIGHTS_URL}${REACT_APP_HIGHLIGHTS_URL}`);
  const buyPrintConfigLoader = createBuyPrintConfigLoader(REACT_APP_BUY_PRINT_CONFIG_URL);
  const practiceQuestionsLoader = createPracticeQuestionsLoader();
  const bookConfigLoader = createBookConfigLoader();

  const services = {
    archiveLoader,
    bookConfigLoader,
    buyPrintConfigLoader,
    config,
    highlightClient,
    osWebLoader,
    practiceQuestionsLoader,
    searchClient,
    userLoader,
  };

  const getArchiveBook = makeGetArchiveBook(services);
  const getArchivePage = makeGetArchivePage(services);
  const renderPage = makeRenderPage(services, writeS3File);

  const parent = parentPort!;

  parent.on('message', async(message: Message) => {
    const body = message.Body;

    if (!body) {
      throw new Error('[SQS] [ReceiveMessage] Unexpected response: message missing Body key');
    }

    const task = JSON.parse(body);

    switch (task.type) {
      case 'prerender': {
        const payload = task.payload as PrerenderPayload;
        const page = deserializePage(payload.page);
        await renderPage({code: 200, route: page});
        break;
      }
      case 'sitemap': {
        const payload = task.payload as SitemapPayload;
        const pages = payload.pages.map((page: SerializedPageMatch) => deserializePage(page));
        const items = await asyncPool(MAX_CONCURRENT_CONNECTIONS, pages, async(page) => {
          const archivePage = await getArchivePage(page);
          return getSitemapItemOptions(archivePage, matchPathname(page));
        });
        await renderSitemap(payload.slug, items);
        break;
      }
      case 'sitemapIndex': {
        const payload = task.payload as SitemapIndexPayload;
        const books = payload.books.map((book: SerializedBookMatch) => deserializeBook(book));
        const items = await asyncPool(MAX_CONCURRENT_CONNECTIONS, books, async(book) => {
          const archiveBook = await getArchiveBook(book);
          return getSitemapItemOptions(archiveBook, sitemapPath(book.params.book.slug));
        });
        await renderSitemapIndex(items);
        break;
      }
    }

    parent.postMessage(message.ReceiptHandle);
  });
}

run();
