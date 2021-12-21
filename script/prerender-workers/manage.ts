// tslint:disable:no-console
import './setup';

import {
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
  waitUntilStackCreateComplete,
} from '@aws-sdk/client-cloudformation';
import {
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import fetch from 'node-fetch';
import path from 'path';
import portfinder from 'portfinder';
import Loadable from 'react-loadable';
import asyncPool from 'tiny-async-pool';
import { ArchiveBook, ArchivePage, BookWithOSWebData } from '../../src/app/content/types';
import config from '../../src/config';
import BOOKS from '../../src/config.books';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { OSWebBook } from '../../src/gateways/createOSWebLoader';
import { readFile } from '../../src/helpers/fileUtils';
import { startServer, Server } from '../server';
import {
  getStats,
  minuteCounter,
  prepareBookPages,
  prepareBooks,
  stats
} from './contentPages';
import createRedirects from './createRedirects';
import { createDiskCache, writeAssetFile } from './fileUtils';
//import { renderSitemap, renderSitemapIndex } from './sitemap';

const {
  CODE_VERSION,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID,
} = config;

const SANITIZED_RELEASE_ID = RELEASE_ID.replace('/', '-');
const WORKERS_STACK_NAME = `rex-${SANITIZED_RELEASE_ID}-prerender-workers`;
const WORKERS_DEPLOY_TIMEOUT_SECONDS = 180;
const PRERENDER_TIMEOUT_SECONDS = 300;
const MAX_CONCURRENT_BOOK_TOCS = 10;

let networkTime = 0;
(global as any).fetch = (...args: Parameters<typeof fetch>) => {
  const networkTimer = minuteCounter();
  return fetch(...args)
    .then((response) => {
      networkTime += networkTimer();
      return response;
    });
};

const cfnClient = new CloudFormationClient({ region: process.env.WORK_REGION });
const sqsClient = new SQSClient({ region: process.env.WORK_REGION });

let archiveLoader: ReturnType<typeof createArchiveLoader>;
let osWebLoader: ReturnType<typeof createOSWebLoader>;
let server: Server;

let workQueueUrl = '';
//let sitemapQueueUrl = '';
let deadLetterQueueUrl = '';
let queuesAreReady = false;

let timeoutDate;
let numPages = 0;
//const bookSitemaps = {};

async function renderManifest() {
  writeAssetFile('/rex/release.json', JSON.stringify({
    books: BOOKS,
    code: CODE_VERSION,
    id: RELEASE_ID,
  }, null, 2));

  writeAssetFile('/rex/config.json', JSON.stringify(config, null, 2));
}

// These functions begin the stack creation/deletion but do not wait for them to finish,
// since we have other tasks to do while they are running
async function createWorkersStack() {
  // Set the timeoutDate, used also by manage()
  timeoutDate = new Date(1000 * PRERENDER_TIMEOUT_SECONDS + new Date().getTime());

  console.log(`Creating workers stack (not waiting); timeout at ${timeoutDate}`);

  return cfnClient.send(new CreateStackCommand({
    Parameters: [
      {
        ParameterKey: 'BucketName',
        ParameterValue: process.env.BUCKET_NAME,
      },
      {
        ParameterKey: 'BucketRegion',
        ParameterValue: process.env.BUCKET_REGION,
      },
      {
        ParameterKey: 'ReleaseId',
        ParameterValue: SANITIZED_RELEASE_ID,
      },
      {
        ParameterKey: 'ValidUntil',
        ParameterValue: `${timeoutDate.toISOString().slice(0, -5)}Z`,
      },
    ],
    StackName: WORKERS_STACK_NAME,
    Tags: [
      {Key: 'Project', Value: 'Unified'},
      {Key: 'Application', Value: 'Rex'},
      {Key: 'Environment', Value: 'shared'},
      {Key: 'Owner', Value: 'dante'},
    ],
    TemplateBody: readFile(path.join(__dirname, 'cfn.yml')),
  }));
}

async function deleteWorkersStack() {
  console.log('Deleting workers stack (not waiting)');

  return cfnClient.send(new DeleteStackCommand({StackName: WORKERS_STACK_NAME}));
}

async function queueBookPages(book: BookWithOSWebData) {
  const pages = await prepareBookPages(book)

  numPages += pages.length;

  // If the workers stack is not ready yet, wait 100ms and re-check
  while (!queuesAreReady) await new Promise(r => setTimeout(r, 100));

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 10) {
    const pageBatch = pages.slice(pageIndex, pageIndex + 10);

    // If the entire request fails, this command will throw and be caught at the end of this file
    // However, we also need to check if only some of the messages failed
    const sendMessageBatchResult = await sqsClient.send(new SendMessageBatchCommand({
      Entries: pageBatch.map((page, batchIndex) => {
        return {Id: batchIndex.toString(), MessageBody: JSON.stringify(page)};
      }),
      QueueUrl: workQueueUrl,
    }));
    const failedMessages = sendMessageBatchResult.Failed;

    if (!failedMessages) throw new Error('SQS returned something weird (missing failed messages)')

    const numFailures = failedMessages.length;
    if (numFailures > 0) {
      throw new Error(`SQS SendMessageBatch Error: ${numFailures} out of ${pageBatch.length
        } pages in a batch failed to be queued. Failures: ${JSON.stringify(failedMessages)}`);
    }
  }
}

async function manage() {
  await Loadable.preloadAll();
  const port = await portfinder.getPortPromise();
  archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
    appPrefix: '',
    archivePrefix: `http://localhost:${port}`,
    bookCache: createDiskCache<string, ArchiveBook>('archive-books'),
    pageCache: createDiskCache<string, ArchivePage>('archive-pages'),
  });
  osWebLoader = createOSWebLoader(`http://localhost:${port}${REACT_APP_OS_WEB_API_URL}`, {
    cache: createDiskCache<string, OSWebBook | undefined>('osweb'),
  });

  console.log('Starting openstax.org proxy server');

  server = (await startServer({port, onlyProxy: true})).server;

  console.log('Preparing books');

  const books = await prepareBooks(archiveLoader, osWebLoader);

  console.log('Starting queuing threads');

  // We can start fetching book ToCs while the stack is created,
  // but we need a limit so we don't use up all the memory
  const queuePromise = asyncPool(MAX_CONCURRENT_BOOK_TOCS, books, queueBookPages);

  console.log('Waiting for the workers stack to be created');

  // Wait for the workers stack to be ready
  await waitUntilStackCreateComplete(
    {client: cfnClient, maxWaitTime: WORKERS_DEPLOY_TIMEOUT_SECONDS, minDelay: 10, maxDelay: 10},
    {StackName: WORKERS_STACK_NAME}
  );

  console.log('Retrieving queue URLs');

  // Get the queue URLs
  const describeStacksResult = await cfnClient.send(new DescribeStacksCommand({
    StackName: WORKERS_STACK_NAME,
  }));

  // https://github.com/aws/aws-sdk-js-v3/issues/1613
  if (!describeStacksResult.Stacks) throw new Error('CFN returned something weird (missing stacks)')

  const stack = describeStacksResult.Stacks[0];

  if (!stack) throw new Error(`${WORKERS_STACK_NAME} stack not found`);

  if (!stack.Outputs) throw new Error('CFN returned something weird (missing stack outputs)')

  for (const output of stack.Outputs) {
    if (!output.OutputValue) throw new Error('CFN returned something weird (missing output value)')

    switch (output.OutputKey) {
      case `${WORKERS_STACK_NAME}-work-queue-url`:
        workQueueUrl = output.OutputValue;
        break;
      case `${WORKERS_STACK_NAME}-sitemap-queue-url`:
        //sitemapQueueUrl = output.OutputValue;
        break;
      case `${WORKERS_STACK_NAME}-dead-letter-queue-url`:
        deadLetterQueueUrl = output.OutputValue;
        break;
    }
  }

  console.log('Begin queuing prerendering jobs; waiting for all jobs to be queued');

  // Let the queuing begin
  queuesAreReady = true;

  // Wait for all book pages to be queued
  await queuePromise;

  console.log('All prerendering jobs queued; waiting 1 minute for queue attributes to stabilize');

  // TODO: Code between this comment and ENDTODO can maybe be removed
  // if the manager ends up processing the sitemap index and checks the page count there
  // see the commented-out sitemap code after ENDTODO for details

  // Ensure the work queue is empty

  // First wait 1 minute after sending the last message for the queue attributes to stabilize
  // This is required according to SQS docs
  await new Promise((resolve) => setTimeout(resolve, 60000));

  console.log('Waiting for the work queue to be empty');

  // Now check that all the NumberOfMessages attributes are 0
  let workQueueEmpty = false;
  const getQueueAttributesCommand = new GetQueueAttributesCommand({
    AttributeNames: [
      'ApproximateNumberOfMessages',
      'ApproximateNumberOfMessagesDelayed',
      'ApproximateNumberOfMessagesNotVisible',
    ],
    QueueUrl: workQueueUrl,
  });
  do {
    const getQueueAttributesResult = await sqsClient.send(getQueueAttributesCommand);
    const attributes = getQueueAttributesResult.Attributes;

    if (!attributes) throw new Error('SQS returned something weird (missing work queue attrs)');

    workQueueEmpty = attributes['ApproximateNumberOfMessages'] === '0' &&
                     attributes['ApproximateNumberOfMessagesDelayed'] === '0' &&
                     attributes['ApproximateNumberOfMessagesNotVisible'] === '0';
  } while (!workQueueEmpty);

  console.log('Ensuring that the dead letter queue is empty');

  // Ensure that the dead letter queue is also empty
  // Since we are the only consumer of the dead letter queue, we use long polling to check
  // that it is empty rather than waiting another minute and checking the queue attributes
  const receiveDLQMessageResult = await sqsClient.send(new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    QueueUrl: deadLetterQueueUrl,
  }));
  const dlqMessages = receiveDLQMessageResult.Messages;

  if (!dlqMessages) throw new Error('SQS returned something weird (missing dlq messages)');

  if (dlqMessages.length > 0) {
    throw new Error(`Received ${dlqMessages.length} messages from the dead letter queue: ${
      JSON.stringify(dlqMessages)}`);
  }

  // ENDTODO

  // TODO: sitemap
  // If we end up collecting all the sitemaps here and we include a count of pages on each
  // sitemap, we can make sure the total matches numPages
  // If we did that, we wouldn't need to query the work queue attributes.
  // The DLQ check could also be done when we stop receiving sitemap messages
  // The commented out code below shows how this would work

  // Collect sitemaps by book for rendering
  // We also use this to count and ensure we have rendered all the pages
  /*
  let numRenderedPages = 0;
  const receiveSitemapMessageCommand = new ReceiveMessageCommand({
    QueueUrl: sitemapQueueUrl,
    MaxNumberOfMessages: 10,
  });
  const receiveDLQMessageCommand = new ReceiveMessageCommand({
    QueueUrl: deadLetterQueueUrl,
    MaxNumberOfMessages: 10,
  });
  while (numRenderedPages < numPages) {
    const receiveSitemapMessageResult = await sqsClient.send(receiveSitemapMessageCommand);

    if (receiveSitemapMessageResult.Messages.length === 0) {
      // Check the dead letter queue and see if we should abort early
      const receiveDLQMessageResult = await sqsClient.send(receiveDLQMessageCommand);
      const numDLQMessages = receiveDLQMessageResult.Messages.length;
      if (numDLQMessages > 0) {
        throw `Received ${numDLQMessages} messages from the dead letter queue: ${
          JSON.stringify(receiveDLQMessageResult.Messages)}`;
      }

      // Also check if we have exceeded the prerender timeout
      if (new Date() > timeoutDate) {
        throw `Not all sitemaps received within ${PRERENDER_TIMEOUT_SECONDS} seconds.`;
      }
    } else {
      for (const message of receiveSitemapMessageResult.Messages) {
        const sitemaps = JSON.parse(message) as OXSitemapItemOptions[];

        numRenderedPages += sitemap.length;

        for (const sitemap of sitemaps) {
          bookSitemaps[sitemap.bookSlug] ||= [];
          bookSitemaps[sitemap.bookSlug].push(sitemap);
        }
      }
    }
  }
  */

  // All pages have been rendered and sitemaps collected at this point
}

async function cleanup() {
  console.log('Deleting workers stack');

  // Proceed with other tasks while the stack deletes
  await deleteWorkersStack();

  console.log('TODO: sitemap');

  // Render all the sitemaps
  /*
  for (const bookSlug in bookSitemaps) {
    renderSitemap(bookSlug, bookSitemaps[bookSlug]);
  }

  await renderSitemapIndex();
  */
  await renderManifest();
  await createRedirects(archiveLoader, osWebLoader);

  const {elapsedMinutes} = getStats();

  console.log({...stats, elapsedMinutes, networkTime});

  console.log(`Prerender complete. Rendered ${numPages} pages, ${numPages / elapsedMinutes}ppm`);

  server.close();

  // TODO: Wait for the stack to delete and fail the build if it fails to delete?
  //       We can do it to get notified and prevent having a bunch of failed delete stacks,
  //       but for the purposes of the build itself we are already done
}

// Start creating the worker stack first since it takes a while
// Do not wait for the stack creation to complete since we have other tasks to do first
createWorkersStack().then(() => manage().catch(async (e) => {
  // catch for manage() only
  // Do not wait for the stack deletion to complete since we can't handle a delete failure anyway
  await deleteWorkersStack();
  throw e;
})).then(() => cleanup()).catch((e) => {
  // catch for all functions
  console.error(e.message, e.stack);
  process.exit(1);
});
