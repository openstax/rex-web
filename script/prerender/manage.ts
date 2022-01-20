// tslint:disable:no-console

/*
  Manages a fleet of spot instances
  Creates a cloudformation stack with a spot fleet and SQS queues, preloads all the book ToCs,
  queues up each page in the queue to be prerendered, and deletes the stack at the end
*/

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
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { randomBytes } from 'crypto';
import omit from 'lodash/fp/omit';
import path from 'path';
import Loadable from 'react-loadable';
import asyncPool from 'tiny-async-pool';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { assertDefined } from '../../src/app/utils';
import config from '../../src/config';
import BOOKS from '../../src/config.books';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { readFile } from '../../src/helpers/fileUtils';
import { globalMinuteCounter, prepareBookPages } from './contentPages';
import createRedirects from './createRedirects';
import renderManifest from './renderManifest';

const {
  ARCHIVE_URL,
  OS_WEB_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID,
} = config;

if (!RELEASE_ID) { throw new Error('REACT_APP_RELEASE_ID environment variable must be set'); }

// Increasing this too much can lead to connection issues and greater memory usage in the manager
const MAX_CONCURRENT_BOOKS = 5;

// The worker fleet is automatically terminated after this many seconds
// This is insurance in case this process gets stuck or crashes without deleting the workers stack
const PRERENDER_TIMEOUT_SECONDS = 1800;

// Abort the build if the workers stack is not ready after this many seconds
const WORKERS_DEPLOY_TIMEOUT_SECONDS = 120;

const BUCKET_NAME = process.env.BUCKET_NAME || 'sandbox-unified-web-primary';
const BUCKET_REGION = process.env.BUCKET_REGION || 'us-east-1';
const PUBLIC_URL = process.env.PUBLIC_URL || `/rex/releases/${RELEASE_ID}`;
const WORK_REGION = process.env.WORK_REGION || 'us-east-2';

// Docker accepts only lowercase alphanumeric characters and dashes
const SANITIZED_RELEASE_ID = RELEASE_ID.replace(/\//g, '-').toLowerCase();

// Generate a 16 alphanumeric char random build ID, used to keep the stack and resource names unique
// The argument to randomBytes() just has to be large enough
// so that we still have 16 characters left after removing all +, / and =
const BUILD_ID = randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

const WORKERS_STACK_NAME = `rex-${SANITIZED_RELEASE_ID}-prerender-workers-${BUILD_ID}`;

const cfnClient = new CloudFormationClient({ region: WORK_REGION });
const sqsClient = new SQSClient({ region: WORK_REGION });

let archiveLoader: ReturnType<typeof createArchiveLoader>;
let osWebLoader: ReturnType<typeof createOSWebLoader>;
let bookLoader: ReturnType<typeof makeUnifiedBookLoader>;

let resolveWorkQueuePromise: (workQueueUrl: string) => void;
const workQueuePromise = new Promise<string>((resolve) => { resolveWorkQueuePromise = resolve; });

let timeoutDate: Date;
let numBooks = 0;
let numPages = 0;

// These functions begin the stack creation/deletion but do not wait for them to finish,
// since we have other tasks to do while they are running
async function createWorkersStack() {
  // Set the timeoutDate, used also by manage()
  timeoutDate = new Date(1000 * PRERENDER_TIMEOUT_SECONDS + new Date().getTime());

  console.log(`Prerender timeout set to ${timeoutDate}`);
  console.log('Started workers stack creation');

  return cfnClient.send(new CreateStackCommand({
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
        ParameterKey: 'PublicUrl',
        ParameterValue: PUBLIC_URL,
      },
      {
        ParameterKey: 'ReleaseId',
        ParameterValue: RELEASE_ID,
      },
      {
        ParameterKey: 'SanitizedReleaseId',
        ParameterValue: SANITIZED_RELEASE_ID,
      },
      {
        ParameterKey: 'BuildId',
        ParameterValue: BUILD_ID,
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
  console.log('Started workers stack deletion');

  return cfnClient.send(new DeleteStackCommand({StackName: WORKERS_STACK_NAME}));
}

async function prepareAndQueueBook([bookId, {defaultVersion}]: [string, {defaultVersion: string}]) {
  // Don't have the book title yet at this point
  console.log(`Loading book ${bookId}@${defaultVersion}`);

  const book = await bookLoader(bookId, defaultVersion);

  console.log(`[${book.title}] Book loaded; preparing pages`);

  const pages = prepareBookPages(book).map((page) => omit('route', page));
  const numBookPages = pages.length;
  numPages += numBookPages;

  // Wait until the work queue is ready
  const workQueueUrl = await workQueuePromise;

  console.log(`[${book.title}] Queuing ${numBookPages} book pages in batches of 10`);

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 10) {
    const pageBatch = pages.slice(pageIndex, pageIndex + 10);

    // If the entire request fails, this command will throw and be caught at the end of this file
    // However, we also need to check if only some of the messages failed
    const sendMessageBatchResult = await sqsClient.send(new SendMessageBatchCommand({
      Entries: pageBatch.map((page, batchIndex) => ({
        Id: batchIndex.toString(),
        MessageBody: JSON.stringify({ payload: { page }, type: 'page' }),
      })),
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

  console.log(`[${book.title}] All ${numBookPages} book pages queued`);

  // console.log(`[${book.title}] Queuing sitemap`);

  await sqsClient.send(new SendMessageCommand({
    MessageBody: JSON.stringify({ payload: { pages, slug: book.slug }, type: 'sitemap' }),
    QueueUrl: workQueueUrl,
  }));

  console.log(`[${book.title}] Sitemap queued`);

  // Used in the sitemap index
  return {
    params: { book: { slug: book.slug } },
    state: { bookUid: book.id, bookVersion: book.version },
  };
}

async function manage() {
  console.log('Preloading route components');

  await Loadable.preloadAll();

  archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
    appPrefix: '',
    archivePrefix: ARCHIVE_URL,
  });
  osWebLoader = createOSWebLoader(`${OS_WEB_URL}${REACT_APP_OS_WEB_API_URL}`);

  bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  // We can start fetching book ToCs while the stack is created,
  // but we need a limit so we don't use up all the memory
  console.log(`Loading books in batches of ${MAX_CONCURRENT_BOOKS}`);

  const allPagesQueuedPromise = asyncPool(
    MAX_CONCURRENT_BOOKS, Object.entries(BOOKS), prepareAndQueueBook
  );

  // Wait for the workers stack to be ready
  await waitUntilStackCreateComplete(
    {client: cfnClient, maxWaitTime: WORKERS_DEPLOY_TIMEOUT_SECONDS, minDelay: 10, maxDelay: 10},
    {StackName: WORKERS_STACK_NAME}
  );

  console.log('Retrieving queue URLs');

  // Get the queue URLs
  const describeStacksResult = await cfnClient.send(
    new DescribeStacksCommand({StackName: WORKERS_STACK_NAME})
  );

  const stacks = assertDefined(
    describeStacksResult.Stacks, '[CFN] [DescribeStacks] Unexpected response: missing Stacks key'
  );
  const stack = assertDefined(stacks[0], `${WORKERS_STACK_NAME} stack not found`);
  const outputs = assertDefined(
    stack.Outputs, '[CFN] [DescribeStacks] Unexpected response: missing stack Outputs key'
  );

  let workQueueUrl: string | undefined;
  let deadLetterQueueUrl: string | undefined;

  for (const output of outputs) {
    const outputKey = assertDefined(
      output.OutputKey,
      '[CFN] [DescribeStacks] Unexpected response: missing output OutputKey key'
    );
    const outputValue = assertDefined(
      output.OutputValue,
      '[CFN] [DescribeStacks] Unexpected response: missing output OutputValue key'
    );

    switch (outputKey) {
      case 'WorkQueueUrl':
        workQueueUrl = outputValue;
        resolveWorkQueuePromise(workQueueUrl);
        break;
      case 'DeadLetterQueueUrl':
        deadLetterQueueUrl = outputValue;
        break;
    }
  }

  if (!workQueueUrl) {
    throw new Error(`${WORKERS_STACK_NAME} stack did not have a WorkQueueUrl output`);
  }

  if (!deadLetterQueueUrl) {
    throw new Error(`${WORKERS_STACK_NAME} stack did not have a DeadLetterQueueUrl output`);
  }

  console.log('Waiting for all jobs to be queued');

  // Wait for all book pages to be queued
  const books = await allPagesQueuedPromise;

  numBooks = books.length;

  console.log(`All ${numPages} page prerendering jobs and all ${numBooks} sitemap jobs queued`);

  // console.log('Queuing sitemap index job');

  await sqsClient.send(new SendMessageCommand({
    MessageBody: JSON.stringify({ payload: { books }, type: 'sitemapIndex' }),
    QueueUrl: workQueueUrl,
  }));

  console.log('1 sitemap index job queued');

  const numJobs = numPages + numBooks + 1;

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
    const attributes = assertDefined(
      getQueueAttributesResult.Attributes,
      '[SQS] [GetQueueAttributes] Unexpected response: missing Attributes key'
    );

    const numMessages = parseInt(attributes.ApproximateNumberOfMessages, 10) +
      parseInt(attributes.ApproximateNumberOfMessagesDelayed, 10) +
      parseInt(attributes.ApproximateNumberOfMessagesNotVisible, 10);

    if (numMessages === 0) { break; }

    console.log(`${numMessages}/${numJobs} prerendering jobs remaining`);

    if (new Date() > timeoutDate) {
      throw new Error(`Not all prerendering jobs finished within ${
        PRERENDER_TIMEOUT_SECONDS} seconds of stack creation.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  console.log(`All ${numJobs} prerendering jobs finished`);

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

  console.log(`The dead letter queue is empty; all ${numJobs} jobs finished successfully`);

  // All pages, sitemaps and sitemap index have been rendered at this point
}

async function cleanup() {
  // Proceed with other tasks while the stack deletes
  await deleteWorkersStack();

  await renderManifest();
  await createRedirects(archiveLoader, osWebLoader);

  const elapsedMinutes = globalMinuteCounter();

  console.log(
    `Prerender complete in ${elapsedMinutes} minutes. Rendered ${numPages} pages, ${
    numBooks} sitemaps and the sitemap index. ${numPages / elapsedMinutes}ppm`
  );

  /* TODO?: Wait for the stack to delete and fail the build if it fails to delete
            We can do it to get notified and prevent having a bunch of failed delete stacks,
            but for the purposes of the build itself we are already done */
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
