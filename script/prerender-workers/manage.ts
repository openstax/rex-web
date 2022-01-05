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
import omit from 'lodash/fp/omit';
import fetch from 'node-fetch';
import { cpus } from 'os';
import path from 'path';
import Loadable from 'react-loadable';
import asyncPool from 'tiny-async-pool';
import { BookWithOSWebData } from '../../src/app/content/types';
import config from '../../src/config';
import BOOKS from '../../src/config.books';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { readFile } from '../../src/helpers/fileUtils';
import {
  getStats,
  minuteCounter,
  prepareBookPages,
  prepareBooks,
  stats
} from './contentPages';
import createRedirects from './createRedirects';
import { writeAssetFile } from './fileUtils';
// import { renderSitemap, renderSitemapIndex } from './sitemap';

const {
  ARCHIVE_URL,
  CODE_VERSION,
  OS_WEB_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID,
} = config;

const MAX_CONCURRENT_BOOK_TOCS = cpus().length;
const PRERENDER_TIMEOUT_SECONDS = 1800;
const WORKERS_DEPLOY_TIMEOUT_SECONDS = 120;

const BUCKET_NAME = process.env.BUCKET_NAME || 'sandbox-unified-web-primary';
const BUCKET_REGION = process.env.BUCKET_REGION || 'us-east-1';
const PUBLIC_URL = process.env.PUBLIC_URL || `/rex/releases/${RELEASE_ID}`;
const RELEASE_ID_SUFFIX = RELEASE_ID.split('/', 2)[1];
const WORK_REGION = process.env.WORK_REGION || 'us-east-2';
const WORKERS_STACK_NAME = `rex-${CODE_VERSION}-${RELEASE_ID_SUFFIX}-prerender-workers`;

let networkTime = 0;
(global as any).fetch = (...args: Parameters<typeof fetch>) => {
  const networkTimer = minuteCounter();
  return fetch(...args)
    .then((response) => {
      networkTime += networkTimer();
      return response;
    });
};

const cfnClient = new CloudFormationClient({ region: WORK_REGION });
const sqsClient = new SQSClient({ region: WORK_REGION });

let archiveLoader: ReturnType<typeof createArchiveLoader>;
let osWebLoader: ReturnType<typeof createOSWebLoader>;

let workQueueUrl = '';
// let sitemapQueueUrl = '';
let deadLetterQueueUrl = '';
let queuesAreReady = false;

let timeoutDate: Date;
let numPages = 0;
// const bookSitemaps = {};

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

  console.log(`Prerender timeout set to ${timeoutDate}`);
  console.log('Creating workers stack (not waiting)');

  return await cfnClient.send(new CreateStackCommand({
    Parameters: [
      {
        ParameterKey: 'BucketName',
        ParameterValue: BUCKET_NAME,
      },
      {
        ParameterKey: 'BucketRegion',
        ParameterValue: BUCKET_REGION,
      },
      {
        ParameterKey: 'CodeVersion',
        ParameterValue: CODE_VERSION,
      },
      {
        ParameterKey: 'PublicUrl',
        ParameterValue: PUBLIC_URL,
      },
      {
        ParameterKey: 'ReleaseIdSuffix',
        ParameterValue: RELEASE_ID_SUFFIX,
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

  return await cfnClient.send(new DeleteStackCommand({StackName: WORKERS_STACK_NAME}));
}

async function queueBookPages(book: BookWithOSWebData) {
  // if (book.slug !== 'college-physics') { return; }
  console.log(`[${book.title}] Preparing book pages`);

  const pages = await prepareBookPages(book);
  const numBookPages = pages.length;
  numPages += numBookPages;

  // If the workers stack is not ready yet, wait 100ms and re-check
  while (!queuesAreReady) { await new Promise((r) => setTimeout(r, 100)); }

  console.log(`[${book.title}] Queuing ${numBookPages} book pages in batches of 10`);

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 10) {
    const pageBatch = pages.slice(pageIndex, pageIndex + 10);

    // If the entire request fails, this command will throw and be caught at the end of this file
    // However, we also need to check if only some of the messages failed
    const sendMessageBatchResult = await sqsClient.send(new SendMessageBatchCommand({
      Entries: pageBatch.map((page, batchIndex) => {
        return {Id: batchIndex.toString(), MessageBody: JSON.stringify(omit('route', page.route))};
      }),
      QueueUrl: workQueueUrl,
    }));

    const failedMessages = sendMessageBatchResult.Failed || [];
    const numFailures = failedMessages.length;
    if (numFailures > 0) {
      throw new Error(`[SQS] [SendMessageBatch] Error: ${numFailures} out of ${pageBatch.length
        } pages in a batch failed to be queued. Failures: ${JSON.stringify(failedMessages)}`);
    }

    const successfulMessages = sendMessageBatchResult.Successful || [];
    const numSuccesses = successfulMessages.length;
    if (numSuccesses < pageBatch.length) {
      throw new Error(`[SQS] [SendMessageBatch] Unexpected response: received only ${numSuccesses
        } successes out of ${pageBatch.length} pages in a batch but also no failures. Successes: ${
        JSON.stringify(successfulMessages)}`);
    }
  }

  console.log(`[${book.title}] Done queuing all ${numBookPages} book pages`);
}

async function manage() {
  console.log('Preloading routes');

  await Loadable.preloadAll();

  archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
    appPrefix: '',
    archivePrefix: ARCHIVE_URL,
  });
  osWebLoader = createOSWebLoader(`${OS_WEB_URL}${REACT_APP_OS_WEB_API_URL}`);

  console.log('Preparing all books');

  const books = await prepareBooks(archiveLoader, osWebLoader);

  console.log(`Starting ${MAX_CONCURRENT_BOOK_TOCS} queuing threads`);

  // We can start fetching book ToCs while the stack is created,
  // but we need a limit so we don't use up all the memory
  const queuePromise = asyncPool(MAX_CONCURRENT_BOOK_TOCS, books, queueBookPages);

  // Just to make the message below print after the book queuing messages
  await new Promise((r) => setTimeout(r, 0));

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
  if (!describeStacksResult.Stacks) {
    throw new Error('[CFN] [DescribeStacks] Unexpected response: missing Stacks key');
  }

  const stack = describeStacksResult.Stacks[0];

  if (!stack) { throw new Error(`${WORKERS_STACK_NAME} stack not found`); }

  if (!stack.Outputs) {
    throw new Error('[CFN] [DescribeStacks] Unexpected response: missing stack Outputs key');
  }

  for (const output of stack.Outputs) {
    if (!output.OutputValue) {
      throw new Error('[CFN] [DescribeStacks] Unexpected response: missing output OutputValue key');
    }

    switch (output.OutputKey) {
      case 'WorkQueueUrl':
        workQueueUrl = output.OutputValue;
        break;
      case 'SitemapQueueUrl':
        // sitemapQueueUrl = output.OutputValue;
        break;
      case 'DeadLetterQueueUrl':
        deadLetterQueueUrl = output.OutputValue;
        break;
    }
  }

  if (!workQueueUrl) {
    throw new Error(`${WORKERS_STACK_NAME} stack did not have a WorkQueueUrl output`);
  }

  /*
  if (!sitemapQueueUrl) {
    throw new Error(`${WORKERS_STACK_NAME} stack did not have a SitemapQueueUrl output`);
  }
  */

  if (!deadLetterQueueUrl) {
    throw new Error(`${WORKERS_STACK_NAME} stack did not have a DeadLetterQueueUrl output`);
  }

  console.log('Begin queuing prerendering jobs');

  // Let the queuing begin
  queuesAreReady = true;

  console.log('Waiting for all jobs to be queued');

  // Wait for all book pages to be queued
  await queuePromise;

  console.log(`All ${numPages} page prerendering jobs queued`);

  // TODO: Code between this comment and ENDTODO can maybe be removed
  // if the manager ends up processing the sitemap index and checks the page count there
  // see the commented-out sitemap code after ENDTODO for details

  // Ensure the work queue is empty

  console.log('Waiting 1 minute for the work queue attributes to stabilize');

  // First wait 1 minute after sending the last message for the queue attributes to stabilize
  // This is required according to SQS docs
  await new Promise((resolve) => setTimeout(resolve, 60000));

  console.log('Waiting for the work queue to be empty');

  // Now check that all the NumberOfMessages attributes are 0
  const getQueueAttributesCommand = new GetQueueAttributesCommand({
    AttributeNames: [
      'ApproximateNumberOfMessages',
      'ApproximateNumberOfMessagesDelayed',
      'ApproximateNumberOfMessagesNotVisible',
    ],
    QueueUrl: workQueueUrl,
  });
  while (true) {
    const getQueueAttributesResult = await sqsClient.send(getQueueAttributesCommand);
    const attributes = getQueueAttributesResult.Attributes;

    if (!attributes) {
      throw new Error('[SQS] [GetQueueAttributes] Unexpected response: missing Attributes key');
    }

    const numMessages = parseInt(attributes.ApproximateNumberOfMessages, 10) +
      parseInt(attributes.ApproximateNumberOfMessagesDelayed, 10) +
      parseInt(attributes.ApproximateNumberOfMessagesNotVisible, 10);

    if (numMessages === 0) { break; }

    console.log(`${numMessages}/${numPages} prerendering jobs remaining`);

    if (new Date() > timeoutDate) {
      throw new Error(`Not all prerendering jobs finished within ${
        PRERENDER_TIMEOUT_SECONDS} seconds of stack creation.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  console.log(`All ${numPages} prerendering jobs finished`);

  console.log('Ensuring that the dead letter queue is empty');

  // Ensure that the dead letter queue is also empty
  // Since we are the only consumer of the dead letter queue, we use long polling to check
  // that it is empty rather than waiting another minute and checking the queue attributes
  const receiveDLQMessageResult = await sqsClient.send(new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    QueueUrl: deadLetterQueueUrl,
  }));

  const dlqMessages = receiveDLQMessageResult.Messages || [];

  if (dlqMessages.length > 0) {
    throw new Error(`Some pages failed to render: ${JSON.stringify(dlqMessages)}`);
  }

  console.log(`The dead letter queue is empty; all ${numPages} pages rendered successfully`);

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

  // TODO: Wait for the stack to delete and fail the build if it fails to delete?
  //       We can do it to get notified and prevent having a bunch of failed delete stacks,
  //       but for the purposes of the build itself we are already done
}

// Start creating the worker stack first since it takes a while
// Do not wait for the stack creation to complete since we have other tasks to do first
createWorkersStack().then(() => manage().catch(async(e) => {
  // catch for manage() only
  // Do not wait for the stack deletion to complete since we can't handle a delete failure anyway
  await deleteWorkersStack();

  throw e;
})).then(() => cleanup()).catch((e) => {
  // catch for all functions
  console.error(e.message, e.stack);
  process.exit(1);
});
