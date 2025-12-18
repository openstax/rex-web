// tslint:disable:no-console

/*
  Manages a fleet of spot instances
  Creates a cloudformation stack with a spot fleet and SQS queues, preloads all the book ToCs,
  queues up each page in the queue to be prerendered, and deletes the stack at the end
*/

import {
  CloudFormationClient,
  CreateStackCommand,
  CreateStackCommandOutput,
  DeleteStackCommand,
  DeleteStackCommandOutput,
  DescribeStacksCommand,
  DescribeStacksCommandOutput,
  Output,
  waitUntilStackCreateComplete,
  waitUntilStackDeleteComplete,
} from '@aws-sdk/client-cloudformation';
import {
  ECSClient,
  UpdateServiceCommand,
  UpdateServiceCommandOutput,
} from '@aws-sdk/client-ecs';
import {
  GetQueueAttributesCommand,
  GetQueueAttributesResult,
  ReceiveMessageCommand,
  ReceiveMessageResult,
  SendMessageBatchCommand,
  SendMessageBatchResult,
  SendMessageCommand,
  SendMessageResult,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { randomBytes } from 'crypto';
import { formatInTimeZone } from 'date-fns-tz';
import chunk from 'lodash/fp/chunk';
import path from 'path';
import asyncPool from 'tiny-async-pool';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { assertDefined } from '../../src/app/utils';
import BOOKS from '../../src/config.books';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import { getBooksConfigSync } from '../../src/gateways/createBookConfigLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { readFile } from '../../src/helpers/fileUtils';
import { globalMinuteCounter, prepareBookPages } from './contentPages';
import { SerializedPageMatch } from './contentRoutes';
import createRedirects from './createRedirects';
import './logUnhandledRejectionsAndExit';
import renderManifest from './renderManifest';
import { SitemapPayload, renderAndSaveSitemapIndex } from './sitemap';
import { writeS3ReleaseXmlFile } from './fileUtils';
import { renderAndSaveContentManifest } from './contentManifest';
import { ARCHIVE_URL, OS_WEB_URL, REACT_APP_OS_WEB_API_URL, CODE_VERSION } from '../../src/config';
import { RELEASE_ID, WORK_REGION, BUCKET_NAME, BUCKET_REGION, PUBLIC_URL } from './constants';

// Increasing this too much can lead to connection issues and greater memory usage in the manager
const MAX_CONCURRENT_BOOKS = 5;

// Number of concurrent prerender tasks to run
const DESIRED_TASK_COUNT = 256;

// Total fleet memory capacity in MiB (must equal DESIRED_TASK_COUNT * 1024)
const TOTAL_MEMORY_MIB = DESIRED_TASK_COUNT * 1024;

// Retry EPROTO errors in requests this many times
const MAX_ATTEMPTS = 5;

// The worker fleet is automatically terminated after this many seconds
// This is insurance in case this process gets stuck or crashes without deleting the workers stack
const PRERENDER_TIMEOUT_SECONDS = 3600;

// Abort the build if the workers stack is not created/deleted within this many seconds
const WORKERS_STACK_CREATE_TIMEOUT_SECONDS = 600;
const WORKERS_STACK_DELETE_TIMEOUT_SECONDS = WORKERS_STACK_CREATE_TIMEOUT_SECONDS;

// Docker does not accept forward slashes in the image tag
const IMAGE_TAG = process.env.IMAGE_TAG || `${RELEASE_ID.replace(/\//g, '-')}`;

const cfnClient = new CloudFormationClient({ region: WORK_REGION });
const ecsClient = new ECSClient({ region: WORK_REGION });
const sqsClient = new SQSClient({ region: WORK_REGION });

type PageTask = { payload: SerializedPageMatch, type: 'page' };
type SitemapTask = { payload: SitemapPayload, type: 'sitemap' };

const booksConfig = getBooksConfigSync();
const archiveLoader = createArchiveLoader({
  appPrefix: '',
  archivePrefix: ARCHIVE_URL,
});
const osWebLoader = createOSWebLoader(`${OS_WEB_URL}${REACT_APP_OS_WEB_API_URL}`);
const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader, {booksConfig});

const timeoutDate = new Date(1000 * PRERENDER_TIMEOUT_SECONDS + new Date().getTime());

console.log(`Prerender timeout set to ${timeoutDate}`);

async function sendWithRetries(
  client: CloudFormationClient, command: CreateStackCommand
): Promise<CreateStackCommandOutput>;
async function sendWithRetries(
  client: CloudFormationClient, command: DeleteStackCommand
): Promise<DeleteStackCommandOutput>;
async function sendWithRetries(
  client: CloudFormationClient, command: DescribeStacksCommand
): Promise<DescribeStacksCommandOutput>;
async function sendWithRetries(
  client: ECSClient, command: UpdateServiceCommand
): Promise<UpdateServiceCommandOutput>;
async function sendWithRetries(
  client: SQSClient, command: GetQueueAttributesCommand
): Promise<GetQueueAttributesResult>;
async function sendWithRetries(
  client: SQSClient, command: ReceiveMessageCommand
): Promise<ReceiveMessageResult>;
async function sendWithRetries(
  client: SQSClient, command: SendMessageBatchCommand
): Promise<SendMessageBatchResult>;
async function sendWithRetries(
  client: SQSClient, command: SendMessageCommand
): Promise<SendMessageResult>;
async function sendWithRetries<C extends CreateStackCommand | DeleteStackCommand |
DescribeStacksCommand | UpdateServiceCommand | GetQueueAttributesCommand | ReceiveMessageCommand |
SendMessageBatchCommand | SendMessageCommand, R extends CreateStackCommandOutput |
DeleteStackCommandOutput | DescribeStacksCommandOutput | UpdateServiceCommandOutput | GetQueueAttributesResult |
ReceiveMessageResult | SendMessageBatchResult | SendMessageResult>(
  client: { send: (command: C) => Promise<R> }, command: C
): Promise<R> {
  let attempt = 1;
  while (true) {
    try {
      // return await is required here to catch the error
      return await client.send(command);
    } catch (error: any) {
      if (attempt >= MAX_ATTEMPTS || error.code !== 'EPROTO') {
        throw error;
      }

      attempt++;
    }
  }
}

async function callWithRetries<A, R>(func: (a: A) => Promise<R>, a: A): Promise<R>;
async function callWithRetries<A, B, R>(func: (a: A, b: B) => Promise<R>, a: A, b: B): Promise<R>;
async function callWithRetries<A, B, R>(
  func: (a: A, b?: B) => Promise<R>, a: A, b?: B
): Promise<R> {
  let attempt = 1;
  while (true) {
    try {
      // return await is required here to catch the error
      return await (b === undefined ? func(a) : func(a, b));
    } catch (error: any) {
      if (attempt >= MAX_ATTEMPTS || error.code !== 'EPROTO') {
        throw error;
      }

      attempt++;
    }
  }
}

async function createWorkersStack() {
  // Generate a 16 alphanum char random build ID, used to keep the stack and resource names unique
  // The argument to randomBytes() just has to be large enough
  // so that we still have 16 characters left after removing all +, / and =
  const buildId = randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  const workersStackName = `rex-${IMAGE_TAG}-prerender-workers-${buildId}`;

  console.log(`Creating ${workersStackName} stack...`);

  await sendWithRetries(cfnClient, new CreateStackCommand({
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
        ParameterKey: 'ImageTag',
        ParameterValue: IMAGE_TAG,
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
        ParameterKey: 'TotalMemoryMiB',
        ParameterValue: TOTAL_MEMORY_MIB.toString(),
      },
      {
        ParameterKey: 'ValidUntil',
        ParameterValue: formatInTimeZone(timeoutDate, 'UTC', 'yyyy-MM-dd\'T\'HH:mm:ssX'),
      },
    ],
    StackName: workersStackName,
    Tags: [
      {Key: 'Project', Value: 'DISCO'},
      {Key: 'Application', Value: 'Rex'},
      {Key: 'Environment', Value: 'shared'},
      {Key: 'Owner', Value: 'dante'},
    ],
    TemplateBody: readFile(path.join(__dirname, 'cfn.yml')),
  }));

  // We return this immediately without waiting for the stack to be created
  // so we can cleanup properly if there's a failure during waiting
  return workersStackName;
}

async function deleteWorkersStack(workersStackName: string) {
  console.log(`Deleting ${workersStackName} stack...`);

  await sendWithRetries(cfnClient, new DeleteStackCommand({StackName: workersStackName}));

  return callWithRetries(waitUntilStackDeleteComplete,
    {
      client: cfnClient,
      maxDelay: 10,
      maxWaitTime: WORKERS_STACK_DELETE_TIMEOUT_SECONDS,
      minDelay: 10,
    },
    {StackName: workersStackName}
  );
}

function findOutputValue(outputs: Output[], key: string) {
  const foundOutput = outputs.find((output: Output) => {
    const outputKey = assertDefined(
      output.OutputKey, '[CFN] [DescribeStacks] Unexpected response: missing output OutputKey'
    );

    return outputKey === key;
  });

  const existingOutput = assertDefined(foundOutput, `Stack Output with OutputKey ${key} not found`);

  return assertDefined(
    existingOutput.OutputValue,
    `[CFN] [DescribeStacks] Unexpected response: missing ${key} output OutputValue`
  );
}

// Returns an object containing the workQueueUrl and deadLetterQueueUrl
async function getQueueUrls(workersStackName: string) {
  // This wait is here and not in createWorkersStack()
  // so we can cleanup properly if there's a failure during stack creation
  await callWithRetries(waitUntilStackCreateComplete,
    {
      client: cfnClient,
      maxDelay: 10,
      maxWaitTime: WORKERS_STACK_CREATE_TIMEOUT_SECONDS,
      minDelay: 10,
    },
    {StackName: workersStackName}
  );

  console.log('Retrieving queue URLs');

  const describeStacksResult = await sendWithRetries(
    cfnClient, new DescribeStacksCommand({StackName: workersStackName})
  );

  const stacks = assertDefined(
    describeStacksResult.Stacks, '[CFN] [DescribeStacks] Unexpected response: missing Stacks key'
  );
  const stack = assertDefined(stacks[0], `${workersStackName} stack not found`);
  const outputs = assertDefined(
    stack.Outputs, '[CFN] [DescribeStacks] Unexpected response: missing stack Outputs key'
  );

  return {
    deadLetterQueueUrl: findOutputValue(outputs, 'DeadLetterQueueUrl'),
    workQueueUrl: findOutputValue(outputs, 'WorkQueueUrl'),
  };
}

class Stats {
  public pages = 0;
  public sitemaps = 0;
  get total() { return this.pages + this.sitemaps; }
}

function makePrepareAndQueueBook(workQueueUrl: string, stats: Stats) {
  return async([bookId, {defaultVersion}]: [string, {defaultVersion: string}]) => {
    // Don't have the book title yet at this point
    console.log(`Loading book ${bookId}@${defaultVersion}`);

    const book = await callWithRetries(bookLoader, bookId);

    console.log(`[${book.title}] Book loaded; preparing pages`);

    const pages = prepareBookPages(book);
    const numBookPages = pages.length;
    stats.pages += numBookPages;

    console.log(`[${book.title}] Queuing ${numBookPages} book pages in batches of 10`);

    for (const pageBatch of chunk(10, pages)) {
      // If the entire request fails, this command will throw and be caught at the end of this file
      // However, we also need to check if only some of the messages failed
      const sendMessageBatchResult = await sendWithRetries(
        sqsClient, new SendMessageBatchCommand({
          Entries: pageBatch.map((page, batchIndex) => ({
            Id: batchIndex.toString(),
            MessageBody: JSON.stringify({ payload: page, type: 'page' } as PageTask),
          })),
          QueueUrl: workQueueUrl,
        })
      );

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
          } successes out of ${pageBatch.length} pages in a batch but no failures. Successes: ${
          JSON.stringify(successfulMessages)}`);
      }
    }

    console.log(`[${book.title}] All ${numBookPages} book pages queued`);

    await sendWithRetries(sqsClient, new SendMessageCommand({
      MessageBody: JSON.stringify(
        { payload: { pages, slug: book.slug }, type: 'sitemap' } as SitemapTask
      ),
      QueueUrl: workQueueUrl,
    }));

    console.log(`[${book.title}] Sitemap queued`);

    return book;
  };
}

async function queueWork(workQueueUrl: string) {
  const stats = new Stats();

  const prepareAndQueueBook = makePrepareAndQueueBook(workQueueUrl, stats);

  console.log(`Loading and queuing books in batches of ${MAX_CONCURRENT_BOOKS}`);

  const bookConfigs = Object.entries(BOOKS).filter(([, book]) => !book.retired);
  const books = await asyncPool(MAX_CONCURRENT_BOOKS, bookConfigs, prepareAndQueueBook);

  stats.sitemaps = books.length;

  console.log(
    `All ${stats.pages} page prerendering jobs and all ${stats.sitemaps} sitemap jobs queued`
  );

  await Promise.all([
    renderAndSaveSitemapIndex(writeS3ReleaseXmlFile, books),
    renderAndSaveContentManifest(writeS3ReleaseXmlFile, books),
  ]);

  return stats;
}

async function waitUntilWorkDone(
  workQueueUrl: string,
  deadLetterQueueUrl: string,
  stats: Stats
) {
  // Waiting 1 minute is required according to SQS docs (in the "Important" box):
  // https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueAttributes.html
  console.log('Waiting 1 minute for the work queue attributes to stabilize');
  await new Promise((resolve) => setTimeout(resolve, 60000));

  /*
     Now check that all the NumberOfMessages attributes are 0
     In theory we should also wait until we receive 0's for "several minutes"
     to determine that the queue is truly empty:
     https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/confirm-queue-is-empty.html
     We skip this on the assumption that all SQS servers should see all messages,
     since we stopped creating messages at least 1 minute ago,
     and none of these messages should disappear without being properly deleted
  */
  console.log('Waiting for the work queue to be empty');
  const getQueueAttributesCommand = new GetQueueAttributesCommand({
    AttributeNames: [
      'ApproximateNumberOfMessages',
      'ApproximateNumberOfMessagesDelayed',
      'ApproximateNumberOfMessagesNotVisible',
    ],
    QueueUrl: workQueueUrl,
  });
  while (true) {
    const getQueueAttributesResult = await sendWithRetries(sqsClient, getQueueAttributesCommand);
    const attributes = assertDefined(
      getQueueAttributesResult.Attributes,
      '[SQS] [GetQueueAttributes] Unexpected response: missing Attributes key'
    );
    const numberOfMessages = assertDefined(
      attributes.ApproximateNumberOfMessages,
      '[SQS] [GetQueueAttributes] Unexpected response: missing attributes value'
    );
    const messagesDelayed = assertDefined(
      attributes.ApproximateNumberOfMessagesDelayed,
      '[SQS] [GetQueueAttributes] Unexpected response: missing attributes value'
    );
    const messagesNotVisible = assertDefined(
      attributes.ApproximateNumberOfMessagesNotVisible,
      '[SQS] [GetQueueAttributes] Unexpected response: missing attributes value'
    );

    const numMessages = parseInt(numberOfMessages, 10) +
      parseInt(messagesDelayed, 10) +
      parseInt(messagesNotVisible, 10);

    if (numMessages === 0) { break; }

    console.log(`${numMessages}/${stats.total} prerendering jobs remaining`);

    if (new Date() > timeoutDate) {
      throw new Error(`Not all prerendering jobs finished within ${
        PRERENDER_TIMEOUT_SECONDS} seconds of stack creation.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  console.log(`All ${stats.total} prerendering jobs finished`);

  console.log('Ensuring that the dead letter queue is empty');

  // Ensure that the dead letter queue is also empty
  // Since we are the only consumer of the dead letter queue, we use long polling to check
  // that it is empty rather than waiting another minute and checking the queue attributes
  const receiveDLQMessageResult = await sendWithRetries(sqsClient, new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    QueueUrl: deadLetterQueueUrl,
  }));

  const dlqMessages = receiveDLQMessageResult.Messages || [];

  if (dlqMessages.length > 0) {
    throw new Error(`Some pages failed to render: ${JSON.stringify(dlqMessages)}`);
  }

  // All pages, sitemaps and sitemap index have been rendered at this point
  console.log(`The dead letter queue is empty; all ${stats.total} jobs finished successfully`);
}

async function finishRendering(stats: Stats) {
  await renderManifest();
  await createRedirects(archiveLoader, osWebLoader);

  const elapsedMinutes = globalMinuteCounter();

  console.log(
    `Prerender complete in ${elapsedMinutes} minutes. Rendered ${stats.pages} pages, and ${
    stats.sitemaps} sitemaps. ${
    stats.total / elapsedMinutes}ppm`
  );
}

async function manage() {
  let deleteWorkersStackPromise: ReturnType<typeof deleteWorkersStack> | undefined;
  const workersStackName = await createWorkersStack();

  try {
    const { workQueueUrl, deadLetterQueueUrl } = await getQueueUrls(workersStackName);

    console.log(`Scaling service to ${DESIRED_TASK_COUNT} tasks`);
    await sendWithRetries(ecsClient, new UpdateServiceCommand({
      cluster: `${workersStackName}-cluster`,
      desiredCount: DESIRED_TASK_COUNT,
      service: 'Prerendering',
    }));

    const stats = await queueWork(workQueueUrl);
    await waitUntilWorkDone(workQueueUrl, deadLetterQueueUrl, stats);
    deleteWorkersStackPromise = deleteWorkersStack(workersStackName);
    await finishRendering(stats);
  } finally {
    await (deleteWorkersStackPromise ?? deleteWorkersStack(workersStackName));
  }
}

manage();
