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
import { AppOptions } from '../../src/app';
import { ArchiveContent } from '../../src/app/content/types';
import { matchPathname } from '../../src/app/navigation/utils';
import { assertDefined, assertObject, assertString } from '../../src/app/utils';
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
  getArchiveBook,
  getArchivePage,
  renderAndSavePage,
  SerializedBookMatch,
  SerializedPageMatch,
} from './contentPages';
import { writeS3HtmlFile, writeS3XmlFile } from './fileUtils';
import { renderAndSaveSitemap, renderAndSaveSitemapIndex, sitemapPath } from './sitemap';

const MAX_CONCURRENT_CONNECTIONS = 5;

type PagePayload = { page: SerializedPageMatch };
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

// Types won't save us from bad JSON so check that the payload has the correct structure

async function pageTask(services: AppOptions['services'], payload: PagePayload) {
  const page = deserializePage(
    assertObject(payload.page, `Page task payload.page is not an object: ${payload}`)
  );
  return renderAndSavePage(services, writeS3HtmlFile, 200, page);
}

async function sitemapTask(services: AppOptions['services'], payload: SitemapPayload) {
  const pagesArray = assertObject(
    payload.pages, `Sitemap task payload.pages is not an object: ${payload}`
  );
  const pages = pagesArray.map(
    (page: SerializedPageMatch, index: number) => deserializePage(
      assertObject(page, `Sitemap task payload.pages[${index}] is not an object: ${pagesArray}`)
    )
  );
  const items = await asyncPool(MAX_CONCURRENT_CONNECTIONS, pages, async(page) => {
    const archivePage = await getArchivePage(services, page);
    return getSitemapItemOptions(archivePage, matchPathname(page));
  });
  return renderAndSaveSitemap(
    writeS3XmlFile,
    assertString(payload.slug, `Sitemap task payload.slug is not a string: ${payload}`),
    items
  );
}

async function sitemapIndexTask(services: AppOptions['services'], payload: SitemapIndexPayload) {
  const booksArray = assertObject(
    payload.books, `SitemapIndex task payload.books is not an object: ${payload}`
  );
  const books = booksArray.map(
    (book: SerializedBookMatch, index: number) => deserializeBook(
      assertObject(book, `Sitemap task payload.books[${index}] is not an object: ${booksArray}`)
    )
  );
  const items = await asyncPool(MAX_CONCURRENT_CONNECTIONS, books, async(book) => {
    const archiveBook = await getArchiveBook(services, book);
    return getSitemapItemOptions(archiveBook, sitemapPath(book.params.book.slug));
  });
  return renderAndSaveSitemapIndex(writeS3XmlFile, items);
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

  const boundPageTask = pageTask.bind(null, services);
  const boundSitemapTask = sitemapTask.bind(null, services);
  const boundSitemapIndexTask = sitemapIndexTask.bind(null, services);

  const TASKS: { [key: string]: ((payload: any) => void) | undefined } = {
    page: boundPageTask,
    sitemap: boundSitemapTask,
    sitemapIndex: boundSitemapIndexTask,
  };

  const parent = parentPort!;

  parent.on('message', async(message: Message) => {
    const body = assertDefined(
      message.Body, '[SQS] [ReceiveMessage] Unexpected response: message missing Body key'
    );

    // Types won't save us from bad JSON so check that the received JSON has the expected structure

    const task = assertObject(JSON.parse(body), `Task is not an object: ${body}`);

    // Types won't save us from bad JSON so check that the received JSON has the expected structure

    const taskFunction = assertDefined(
      TASKS[assertString(task.type, `Task type is not a string: ${task.type}`)],
      `Unknown task type: ${task.type}`
    );

    await taskFunction(
      assertObject(task.payload, `Task payload is not an object: ${task.payload}`)
    );

    parent.postMessage(message.ReceiptHandle);
  });
}

run();
