// tslint:disable:no-console

/*
  A single worker thread
  Receives messages from work.ts, parses them, renders the pages, uploads them to S3,
  and sends back the entries to be deleted
  This code runs with --unhandled-rejections=strict so unhandled rejections will abort the thread
*/

import './setup';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DeleteMessageBatchRequestEntry, Message } from '@aws-sdk/client-sqs';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import Loadable from 'react-loadable';
import { parentPort } from 'worker_threads';
import { content } from '../../src/app/content/routes';
import { Match } from '../../src/app/navigation/types';
import config from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createBookConfigLoader from '../../src/gateways/createBookConfigLoader';
import createBuyPrintConfigLoader from '../../src/gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../../src/gateways/createHighlightClient';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../../src/gateways/createPracticeQuestionsLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import { renderPages } from './contentPages';

type Payload = Omit<Match<typeof content>, 'route'>;

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

let s3Client: S3Client;

async function saveS3Page(url: string, html: string) {
  let path = process.env.PUBLIC_URL;
  if (path[0] === '/') { path = path.slice(1); }
  const key = `${path}${url}`;

  console.log(`Writing s3 file: /${key}`);

  return await s3Client.send(new PutObjectCommand({
    Body: html,
    Bucket: process.env.BUCKET_NAME,
    CacheControl: 'max-age=0',
    ContentType: 'text/html',
    Key: key,
  }));
}

async function run() {
  console.log('Fetching container credentials');

  const credentials = await fromContainerMetadata();

  console.log('Initializing S3 client');

  s3Client = new S3Client({ credentials, region: process.env.BUCKET_REGION });

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

  const parent = parentPort!;

  parent.on('message', async(messages: Message[]) => {
    console.log(`Parsing ${messages.length} received messages`);

    const pages: Array<{route: Match<typeof content>, code: number}> = [];
    const entries: DeleteMessageBatchRequestEntry[] = [];
    messages.forEach((message, messageIndex) => {
      const body = message.Body;

      if (!body) {
        throw new Error('[SQS] [ReceiveMessage] Unexpected response: message missing Body key');
      }

      const payload = JSON.parse(body) as Payload;
      pages.push({route: {...payload, route: content}, code: 200});
      entries.push({Id: messageIndex.toString(), ReceiptHandle: message.ReceiptHandle});
    });

    console.log(`Rendering ${pages.length} pages`);

    await renderPages(services, pages, saveS3Page);

    parent.postMessage(entries);
  });
}

run();
