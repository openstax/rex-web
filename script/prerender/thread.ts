// tslint:disable:no-console

/*
  A single worker thread
  Receives messages from work.ts, parses them, renders the pages, uploads them to S3,
  and sends back the entries to be deleted
*/

import { Message } from '@aws-sdk/client-sqs';
import Loadable from 'react-loadable';
import asyncPool from 'tiny-async-pool';
import { parentPort } from 'worker_threads';
import { AppOptions } from '../../src/app';
import { matchPathname } from '../../src/app/navigation/utils';
import { assertDefined, assertNotNull, assertObject, assertString, tuple } from '../../src/app/utils';
import config from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createBookConfigLoader from '../../src/gateways/createBookConfigLoader';
import createHighlightClient from '../../src/gateways/createHighlightClient';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../../src/gateways/createPracticeQuestionsLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createImageCDNUtils from '../../src/gateways/createImageCDNUtils';
import { getSitemapItemOptions, renderAndSavePage } from './contentPages';
import {
  deserializePageMatch,
  getArchivePage,
  SerializedPageMatch,
} from './contentRoutes';
import { writeS3ReleaseHtmlFile, writeS3ReleaseXmlFile } from './fileUtils';
import './logUnhandledRejectionsAndExit';
import {
  renderAndSaveSitemap,
  SitemapPayload,
} from './sitemap';
import userLoader from './stubbedUserLoader';

const MAX_CONCURRENT_CONNECTIONS = 5;

const {
  ARCHIVE_URL,
  HIGHLIGHTS_URL,
  OS_WEB_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_SEARCH_URL,
  SEARCH_URL,
} = config;

const parent = assertNotNull(
  parentPort, 'thread.ts must be called in a worker thread from the worker_threads library'
);

// The payload type is known only at runtime, so check that it has the correct structure

function makePageTask(services: AppOptions['services']) {
  return async(payload: SerializedPageMatch) => {
    assertDefined(payload.params, `Page task payload.params is not an object: ${payload}`);
    assertDefined(payload.state, `Page task payload.state is not an object: ${payload}`);
    return renderAndSavePage(services, writeS3ReleaseHtmlFile, 200, payload);
  };
}

function makeSitemapTask(services: AppOptions['services']) {
  return async(payload: SitemapPayload) => {
    const pagesArray = assertObject(
      payload.pages, `Sitemap task payload.pages is not an object: ${payload}`
    );
    const pages = pagesArray.map(
      (page: SerializedPageMatch, index: number) => tuple(
        page,
        deserializePageMatch(
          assertObject(page, `Sitemap task payload.pages[${index}] is not an object: ${pagesArray}`)
        )
      )
    );
    const items = await asyncPool(MAX_CONCURRENT_CONNECTIONS, pages, async([serialized, deserialized]) => {
      const archivePage = await getArchivePage(services, serialized);
      return getSitemapItemOptions(archivePage, decodeURI(matchPathname(deserialized)));
    });
    return renderAndSaveSitemap(
      writeS3ReleaseXmlFile,
      assertString(payload.slug, `Sitemap task payload.slug is not a string: ${payload}`),
      items
    );
  };
}

type AnyTaskFunction = ((payload: SerializedPageMatch) => void) |
                       ((payload: SitemapPayload) => void);

type TaskFunctionsMap = { [key: string]: AnyTaskFunction | undefined };

async function makeTaskFunctionsMap() {
  console.log('Preloading route components');

  await Loadable.preloadAll();

  const archiveLoader = createArchiveLoader({
    appPrefix: '',
    archivePrefix: ARCHIVE_URL,
  });
  const osWebLoader = createOSWebLoader(`${OS_WEB_URL}${REACT_APP_OS_WEB_API_URL}`);
  const searchClient = createSearchClient(`${SEARCH_URL}${REACT_APP_SEARCH_URL}`);
  const highlightClient = createHighlightClient(`${HIGHLIGHTS_URL}${REACT_APP_HIGHLIGHTS_URL}`);
  const practiceQuestionsLoader = createPracticeQuestionsLoader();
  const bookConfigLoader = createBookConfigLoader();

  const services = {
    archiveLoader,
    bookConfigLoader,
    config,
    highlightClient,
    osWebLoader,
    practiceQuestionsLoader,
    searchClient,
    userLoader,
    imageCDNUtils: createImageCDNUtils({prefetchResolutions: true}),
  };

  return {
    page: makePageTask(services),
    sitemap: makeSitemapTask(services),
  } as TaskFunctionsMap;
}

// handleWorkMessage() is used as a callback so it needs to catch and handle any errors
// The alternative would be to throw errors on all unhandled promise rejections,
// which will be future node behavior
function makeHandleWorkMessage(taskFunctions: TaskFunctionsMap) {
  return async(message: Message) => {
    const body = assertDefined(
      message.Body, '[SQS] [ReceiveMessage] Unexpected response: message missing Body key'
    );

    // The JSON structure will be known at runtime only, so types won't save us from bad JSON
    // Check that the JSON has the correct structure

    const messageBody = assertObject(JSON.parse(body), `Message body is not an object: ${body}`);
    const taskType = assertString(
      messageBody.type, `Message body.type is not a string: ${messageBody.type}`
    );
    const taskFunction = assertDefined(taskFunctions[taskType], `Unknown task type: ${taskType}`);
    const payload = assertObject(
      messageBody.payload, `Message body.payload is not an object: ${messageBody.payload}`
    );

    // The type of the payload will also be known at runtime only,
    // so each taskFunction performs some additional checks

    await taskFunction(payload);

    // Send back the ReceiptHandle for successfully-processed messages so they can be deleted
    parent.postMessage(message.ReceiptHandle);
  };
}

async function run() {
  const taskFunctionsMap = await makeTaskFunctionsMap();

  const handleWorkMessage = makeHandleWorkMessage(taskFunctionsMap);

  parent.on('message', handleWorkMessage);
}

run();
