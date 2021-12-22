// tslint:disable:no-console
import './setup';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DeleteMessageBatchCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import portfinder from 'portfinder';
import Loadable from 'react-loadable';
import { content } from '../../src/app/content/routes';
import { ArchiveBook, ArchivePage } from '../../src/app/content/types';
import { Match } from '../../src/app/navigation/types';
import config from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createBookConfigLoader from '../../src/gateways/createBookConfigLoader';
import createBuyPrintConfigLoader from '../../src/gateways/createBuyPrintConfigLoader';
import { BuyPrintResponse } from '../../src/gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../../src/gateways/createHighlightClient';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { OSWebBook } from '../../src/gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../../src/gateways/createPracticeQuestionsLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import { startServer } from '../server';
import { renderPages } from './contentPages';
import { createDiskCache } from './fileUtils';

const {
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_BUY_PRINT_CONFIG_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_SEARCH_URL,
} = config;

type Payload = Omit<Match<typeof content>, 'route'>;

const sqsClient = new SQSClient({ region: process.env.WORK_REGION });
const s3Client = new S3Client({ region: process.env.BUCKET_REGION });

const saveS3Page = (url: string, html: string) => {
  let path = process.env.PUBLIC_URL;
  if (path[0] === '/') path = path.slice(1);
  const key = `${path}${url}`;

  console.log(`Writing s3 file: /${key}`);

  return s3Client.send(new PutObjectCommand({
    Body: html,
    Bucket: process.env.BUCKET_NAME,
    CacheControl: 'max-age=0',
    ContentType: 'text/html',
    Key: key,
  }));
};

async function work() {
  console.log('Initializing worker');

  await Loadable.preloadAll();
  const port = await portfinder.getPortPromise();
  const archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
    appPrefix: '',
    archivePrefix: `http://localhost:${port}`,
    bookCache: createDiskCache<string, ArchiveBook>('archive-books'),
    pageCache: createDiskCache<string, ArchivePage>('archive-pages'),
  });
  const osWebLoader = createOSWebLoader(`http://localhost:${port}${REACT_APP_OS_WEB_API_URL}`, {
    cache: createDiskCache<string, OSWebBook | undefined>('osweb'),
  });

  console.log('Starting openstax.org proxy server');

  // We never close this server it just dies when the worker is terminated
  await startServer({port, onlyProxy: true});

  const userLoader = createUserLoader(`http://localhost:${port}${REACT_APP_ACCOUNTS_URL}`);
  const searchClient = createSearchClient(`http://localhost:${port}${REACT_APP_SEARCH_URL}`);
  const highlightClient = createHighlightClient(`http://localhost:${port}${REACT_APP_HIGHLIGHTS_URL}`);
  const buyPrintConfigLoader = createBuyPrintConfigLoader(REACT_APP_BUY_PRINT_CONFIG_URL, {
    cache: createDiskCache<string, BuyPrintResponse>('buy-print'),
  });
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

  const receiveMessageCommand = new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    QueueUrl: process.env.WORK_QUEUE_URL,
  });

  console.log(`Bucket: ${process.env.BUCKET_NAME} (${process.env.BUCKET_REGION})`);

  while (true) {
    console.log(`Listening to ${process.env.WORK_QUEUE_URL} for work`);

    const receiveMessageResult = await sqsClient.send(receiveMessageCommand);

    const messages = receiveMessageResult.Messages || [];

    const numMessages = messages.length;

    if (numMessages == 0) {
      console.log('Received no messages, waiting 10 seconds to retry')

      await new Promise(r => setTimeout(r, 10000));

      continue;
    }

    console.log(`Parsing ${numMessages} received messages`);

    const pages: Array<{route: Match<typeof content>, code: number}> = [];
    const entries: Array<{Id: string, ReceiptHandle: string}> = [];
    messages.forEach((message, messageIndex) => {
      const body = message.Body;

      if (!body) {
        throw new Error('[SQS] [ReceiveMessage] Unexpected response: message missing Body key');
      }

      const receiptHandle = message.ReceiptHandle;

      if (!receiptHandle) {
        throw new Error(
          '[SQS] [ReceiveMessage] Unexpected response: message missing ReceiptHandle key'
        );
      }

      const payload = JSON.parse(body) as Payload;
      pages.push({route: {...payload, route: content}, code: 200});
      entries.push({Id: messageIndex.toString(), ReceiptHandle: receiptHandle});
    });

    console.log(`Rendering ${pages.length} pages`);

    // const sitemaps =
    await renderPages(services, pages, saveS3Page);

    console.log(`Deleting ${messages.length} messages`);

    // Delete successfully processed messages from the queue
    await sqsClient.send(new DeleteMessageBatchCommand({
      Entries: entries,
      QueueUrl: process.env.WORK_QUEUE_URL,
    }));

    // Queue up the sitemaps for processing elsewhere
    /* TODO: sitemap
    const sendMessageBatchResult = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: process.env.SITEMAP_QUEUE_URL,
      Entries: sitemaps.map((sitemap, index) => {
        return {Id: index.toString(), MessageBody: JSON.stringify(sitemap)};
      }),
    }));*/
  }

  // Code here would never be reached, as the loop above never terminates
}

work().catch((e) => {
  console.error(e.message, e.stack);
  process.exit(1);
});
