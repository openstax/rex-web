import './setup';
import {
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  waitUntilStackCreateComplete,
  waitUntilStackDeleteComplete,
} from '@aws-sdk/client-cloudformation';
import {
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import fetch from 'node-fetch';
import portfinder from 'portfinder';
import Loadable from 'react-loadable';
import { ArchiveBook, ArchivePage } from '../../src/app/content/types';
import config from '../../src/config';
import BOOKS from '../../src/config.books';
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
import {
  getStats,
  minuteCounter,
  prepareBookPages,
  prepareBooks,
  renderPages,
  stats
} from './contentPages';
import createRedirects from './createRedirects';
import { createDiskCache, writeAssetFile, writeHtmlAsset } from './fileUtils';
import { renderSitemap, renderSitemapIndex } from './sitemap';

const {
  CODE_VERSION,
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_BUY_PRINT_CONFIG_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_SEARCH_URL,
  RELEASE_ID,
} = config;

const WORKERS_STACK_NAME = `rex-${RELEASE_ID}-prerender-workers`;
const WORKERS_STACK_TIMEOUT_SECONDS = 300;
const PRERENDER_TIMEOUT_SECONDS = 300;

const cfnClient = CloudFormationClient({ region: process.env.AWS_REGION })
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

let networkTime = 0;
(global as any).fetch = (...args: Parameters<typeof fetch>) => {
  const networkTimer = minuteCounter();
  return fetch(...args)
    .then((response) => {
      networkTime += networkTimer();
      return response;
    });
};

async function renderManifest() {
  writeAssetFile('/rex/release.json', JSON.stringify({
    books: BOOKS,
    code: CODE_VERSION,
    id: RELEASE_ID,
  }, null, 2));

  writeAssetFile('/rex/config.json', JSON.stringify(config, null, 2));
}

// This function begins the stack creation but does not wait for it to finish,
// since we have other tasks to do while it is running
async function createWorkersStack() {
  const createStackCommand = CreateStackCommand(
    {
      StackName: WORKERS_STACK_NAME,
      TemplateURL: 'file://cfn.yml',
      Parameters: [
        {
          ParameterKey: 'BucketName',
          ParameterValue: process.env.BUCKET_NAME,
        },
        {
          ParameterKey: 'ReleaseId',
          ParameterValue: RELEASE_ID,
        },
        {
          ParameterKey: 'ValidUntil',
          ParameterValue: `${new Date(
            1000 * PRERENDER_TIMEOUT_SECONDS + new Date().getTime()
          ).toISOString().slice(0, -5)}Z`,
        },
      ],
      Capabilities: [ 'CAPABILITY_NAMED_IAM' ],
    }
  );
  return cfnClient.send(createStackCommand);
}

async function deleteWorkersStack() {
  const deleteStackCommand = DeleteStackCommand(
    StackName: WORKERS_STACK_NAME,
  );
  return cfnClient.send(deleteStackCommand);
}

async function manage() {
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
  const userLoader = createUserLoader(`http://localhost:${port}${REACT_APP_ACCOUNTS_URL}`);
  const searchClient = createSearchClient(`http://localhost:${port}${REACT_APP_SEARCH_URL}`);
  const highlightClient = createHighlightClient(`http://localhost:${port}${REACT_APP_HIGHLIGHTS_URL}`);
  const buyPrintConfigLoader = createBuyPrintConfigLoader(REACT_APP_BUY_PRINT_CONFIG_URL, {
    cache: createDiskCache<string, BuyPrintResponse>('buy-print'),
  });
  const practiceQuestionsLoader = createPracticeQuestionsLoader();
  const bookConfigLoader = createBookConfigLoader();

  const {server} = await startServer({port, onlyProxy: true});
  const renderHelpers = {
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

  const books = await prepareBooks(archiveLoader, osWebLoader);

  // TODO: Check memory usage
  // If it becomes too high, drop the hash table and move this inside the next loop
  const bookPages = {};
  books.each((book) => bookPages[book] = await prepareBookPages(book))

  // Wait for the workers stack to be ready
  await waitUntilStackCreateComplete(
    {
      params: {maxWaitTime: WORKERS_STACK_TIMEOUT_SECONDS, minDelay: 10, maxDelay: 10},
      input: {StackName: WORKERS_STACK_NAME},
    }
  );

  for (const book of books) {
    const pages = bookPages[book];

    for (var pageIndex = 0; pageIndex < pages.length; pageIndex += 10) {
      const pageBatch = pages.slice(pageIndex, pageIndex + 10);

      const sendMessageBatchCommand = SendMessageBatchCommand(
        QueueUrl: process.env.QUEUE_URL,
        Entries: pageBatch.map((page, index) => {
          return {Id: index.toString(), MessageBody: JSON.stringify(page)};
        }),
      )

      // If the entire request fails, this command will throw and be caught at the end of this file
      // However, we also need to check if only some of the messages failed
      const failed = await sqsClient.send(sendMessageBatchCommand).Failed;
      const numFailures = failed.length;
      if (numFailures > 0) {
        await cfnClient.send(deleteStackCommand);
        throw `SQS SendMessageBatch Error: ${numFailures} out of ${pages.length
          } pages in a batch failed to be queued. Failures: ${JSON.stringify(failed)}`;
      }
    }

    // TODO: sitemap
    //const sitemap = await renderPages(renderHelpers, pages, writeHtmlAsset);

    //renderSitemap(book.slug, sitemap);
  }

  // Wait 1 minute
  // SQS requires this delay after we finish sending messages
  // for the queue attributes to reach consistency
  await new Promise(r => setTimeout(r, 60000));

  // Wait for the queue to be empty
  const getQueueAttributesCommand = GetQueueAttributesCommand(
    QueueUrl: process.env.QUEUE_URL,
    AttributeNames: [
      'ApproximateNumberOfMessages',
      'ApproximateNumberOfMessagesDelayed',
      'ApproximateNumberOfMessagesNotVisible'
    ]
  );

  let queueIsEmpty = false;
  for (const attempts = 0; attempts < PRERENDER_TIMEOUT_SECONDS/10; attempts++) {
    const getQueueAttributesResult = await sqsClient.send(getQueueAttributesCommand);
    //queueIsEmpty = getQueueAttributesResult.
    if (queueIsEmpty) break;

    await new Promise(r => setTimeout(r, 10000));
  }

  if (!queueIsEmpty) {
    throw `Prerender did not finish within the timeout of ${PRERENDER_TIMEOUT_SECONDS} seconds.`;
  }

  // The main queue is empty
  // Instead of waiting a minute for the dead letter queue to also stabilize,
  // we'll just try reading from it to check that it is empty
  // Messages seem to arrive within about 1.5 seconds according to some users' tests,
  // so we set the dead letter queue to have long polling of 3 seconds

  // Check that the dead letter queue is also empty
  const receiveMessageCommand = ReceiveMessageCommand(
    QueueUrl: process.env.DEAD_LETTER_QUEUE_URL,
    MaxNumberOfMessages: 10
  );
  const receiveMessageResult = await sqsClient.send(receiveMessageCommand);

  if (receiveMessageResult.Messages.length) {
    throw `Received one or more messages from the dead letter queue: ${
      JSON.stringify(receiveMessageResult.Messages)}`
  }
}

async function cleanup() {
  // Proceed with other tasks while the stack deletes
  await deleteWorkersStack();

  // TODO: sitemap
  //await renderSitemapIndex();
  await renderManifest();
  await createRedirects(archiveLoader, osWebLoader);

  const {numPages, elapsedMinutes} = getStats();

  // tslint:disable-next-line:no-console max-line-length
  console.log({...stats, elapsedMinutes, networkTime});

  // tslint:disable-next-line:no-console max-line-length
  console.log(`Prerender complete. Rendered ${numPages} pages, ${numPages / elapsedMinutes}ppm`);

  // TODO: Wait for the stack to delete and fail the build if it fails to delete?
  //       We can do it to get notified and prevent having a bunch of failed delete stacks,
  //       but for the purposes of the build itself we are done

  server.close();
}

// Start creating the worker stack first since it takes a while
// Do not wait for the stack creation to complete since we have other tasks to do first
createWorkersStack().then(
  manage().then(
    cleanup().catch((e) => {
      console.error(e.message, e.stack); // tslint:disable-line:no-console
      process.exit(1);
    });
  ).catch((e) => {
    console.error(e.message, e.stack); // tslint:disable-line:no-console
    // Do not wait for the stack deletion to complete since we can't handle a delete failure anyway
    await deleteWorkersStack();
    process.exit(1);
  });
).catch((e) => {
  console.error(e.message, e.stack); // tslint:disable-line:no-console
  process.exit(1);
});
