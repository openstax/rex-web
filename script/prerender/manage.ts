// tslint:disable:no-console
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
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { OSWebBook } from '../../src/gateways/createOSWebLoader';
import { startServer } from '../server';
import {
  getStats,
  minuteCounter,
  prepareBookPages,
  prepareBooks,
  stats
} from './contentPages';
import createRedirects from './createRedirects';
import { createDiskCache, writeAssetFile } from './fileUtils';
import { renderSitemap, renderSitemapIndex, OXSitemapItemOptions } from './sitemap';

const {
  CODE_VERSION,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID,
} = config;

const WORKERS_STACK_NAME = `rex-${RELEASE_ID}-prerender-workers`;
const WORKERS_STACK_TIMEOUT_SECONDS = 300;
const PRERENDER_TIMEOUT_SECONDS = 300;

const cfnClient = new CloudFormationClient({ region: process.env.WORK_REGION })
const sqsClient = new SQSClient({ region: process.env.WORK_REGION });

let networkTime = 0;
(global as any).fetch = (...args: Parameters<typeof fetch>) => {
  const networkTimer = minuteCounter();
  return fetch(...args)
    .then((response) => {
      networkTime += networkTimer();
      return response;
    });
};

let timeoutDate;
let numPages = 0;
const bookSitemaps = {};

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

  return cfnClient.send(new CreateStackCommand({
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
        ParameterValue: `${timeoutDate.toISOString().slice(0, -5)}Z`,
      },
    ],
  }));
}

async function deleteWorkersStack() {
  return cfnClient.send(new DeleteStackCommand({StackName: WORKERS_STACK_NAME}));
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

  const {server} = await startServer({port, onlyProxy: true});

  const books = await prepareBooks(archiveLoader, osWebLoader);

  // TODO: Check memory usage
  // If it becomes too high, drop the hash table and move this inside the next loop
  // or store the pages in a file instead?
  const bookPages = {};
  books.each((book) => {
    bookPages[book] = await prepareBookPages(book);
    numPages += bookPages[book].length;
  });

  // Wait for the workers stack to be ready
  await waitUntilStackCreateComplete({
    params: {maxWaitTime: WORKERS_STACK_TIMEOUT_SECONDS, minDelay: 10, maxDelay: 10},
    input: {StackName: WORKERS_STACK_NAME},
  });

  // Get the queue URLs
  let workQueueUrl;
  let sitemapQueueUrl;
  let deadLetterQueueUrl;
  const describeStacksResult = await cfnClient.send(new DescribeStacksCommand({
    StackName: WORKERS_STACK_NAME
  }));
  for (const output of describeStacksResult.Stacks[0].Outputs) {
    switch (output.OutputKey) {
      case `${WORKERS_STACK_NAME}-work-queue-url`:
        workQueueUrl = output.OutputValue
        break;
      case `${WORKERS_STACK_NAME}-sitemap-queue-url`:
        sitemapQueueUrl = output.OutputValue
        break;
      case `${WORKERS_STACK_NAME}-dead-letter-queue-url`:
        deadLetterQueueUrl = output.OutputValue
        break;
    }
  }

  for (const book of books) {
    const pages = bookPages[book];

    for (var pageIndex = 0; pageIndex < pages.length; pageIndex += 10) {
      const pageBatch = pages.slice(pageIndex, pageIndex + 10);

      // If the entire request fails, this command will throw and be caught at the end of this file
      // However, we also need to check if only some of the messages failed
      const failed = await sqsClient.send(new SendMessageBatchCommand({
        QueueUrl: workQueueUrl,
        Entries: pageBatch.map((page, index) => {
          return {Id: index.toString(), MessageBody: JSON.stringify(page)};
        }),
      })).Failed;
      const numFailures = failed.length;
      if (numFailures > 0) {
        throw `SQS SendMessageBatch Error: ${numFailures} out of ${pages.length
          } pages in a batch failed to be queued. Failures: ${JSON.stringify(failed)}`;
      }
    }
  }

  // Collect sitemaps by book for rendering
  // We also use this to count and ensure we have rendered all the pages
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
      if (receiveDLQMessageResult.Messages.length) {
        throw `Received one or more messages from the dead letter queue: ${
          JSON.stringify(receiveDLQMessageResult.Messages)}`
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

  // All pages have been rendered and sitemaps collected at this point
}

async function cleanup() {
  // Proceed with other tasks while the stack deletes
  await deleteWorkersStack();

  // Render all the sitemaps
  for (const bookSlug in bookSitemaps) {
    renderSitemap(bookSlug, bookSitemaps[bookSlug]);
  }

  await renderSitemapIndex();
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
createWorkersStack().then(
  manage().then(
    cleanup().catch((e) => {
      console.error(e.message, e.stack);
      process.exit(1);
    });
  ).catch((e) => {
    console.error(e.message, e.stack);
    // Do not wait for the stack deletion to complete since we can't handle a delete failure anyway
    await deleteWorkersStack();
    process.exit(1);
  });
).catch((e) => {
  console.error(e.message, e.stack);
  process.exit(1);
});
