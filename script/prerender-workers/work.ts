// tslint:disable:no-console
import './setup';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import portfinder from 'portfinder';
import Loadable from 'react-loadable';
import { ArchiveBook, ArchivePage } from '../../src/app/content/types';
import { content } from '../../src/app/content/routes';
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

const {
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_BUY_PRINT_CONFIG_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_SEARCH_URL,
  RELEASE_ID,
} = config;

type Payload = Omit<Match<typeof content>, 'route'>;

const sqsClient = new SQSClient({ region: process.env.WORK_REGION });
const s3Client = new S3Client({ region: process.env.BUCKET_REGION });

const saveS3Page = (url: string, html: string) => {
  const key = `/rex/releases/${process.env.RELEASE_ID}/${url}`;

  console.log('writing s3 file: ', key);

  return s3Client.send(new PutObjectCommand({
    Body: html,
    Bucket: process.env.BUCKET_NAME,
    CacheControl: 'max-age=0',
    ContentType: 'text/html',
    Key: key,
  }));
};

async function work() => {
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

  const {server} = await startServer({port, onlyProxy: true});

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
    QueueUrl: process.env.WORK_QUEUE_URL,
    MaxNumberOfMessages: 10
  });

  while (true) {
    // Listen to the queue for work
    const receiveMessageResult = await sqsClient.send(receiveMessageCommand);

    console.log(`received messages: ${receiveMessageResult.Messages}`);

    const pages: Array<{
      route: Match<typeof content>,
      code: number,
    }> = receiveMessageResult.Messages.map((message) => {
      const payload = JSON.parse(message.body) as Payload;
      return {route: {...payload, route: content}, code: 200};
    });

    console.log(`rendering ${pages.length} pages`);

    const sitemaps = await renderPages(services, pages, saveS3Page);

    // Queue up the sitemaps for processing
    const sendMessageBatchResult = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: process.env.SITEMAP_QUEUE_URL,
      Entries: sitemaps.map((sitemap, index) => {
        return {Id: index.toString(), MessageBody: JSON.stringify(sitemap)};
      }),
    }));
  }

  // Code here would never be reached, as the loop above never terminates
  // server.close();
};

work().catch((e) => {
  console.error(e.message, e.stack);
  process.exit(1);
});
