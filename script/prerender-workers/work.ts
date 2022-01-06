// tslint:disable:no-console

/*
  Manages worker threads in a single instance
  Receives messages from the SQS queue, distributes them to worker threads,
  and deletes processed messages from the queue
*/

import './setup';

import { DeleteMessageBatchCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { cpus } from 'os';
import path from 'path';
import { Worker } from 'worker_threads';

const sqsClient = new SQSClient({ region: process.env.WORK_REGION });

// Idle worker thread queue
// It only supports 1 waiter at a time but that is all we need

const idleWorkers: Worker[] = [];

let resolveWorkerPromise: ((worker: Worker) => void) | null;

function pushWorker(worker: Worker) {
  if (resolveWorkerPromise) {
    // Someone is waiting for the worker, so resolve the promise rather than adding it to the queue
    resolveWorkerPromise(worker);
    resolveWorkerPromise = null;
  } else {
    // Add the idle worker to the queue
    idleWorkers.push(worker);
  }
}

async function popWorker() {
  // Check if an idle worker is available
  const worker = idleWorkers.pop();

  if (worker) {
    // Return the available idle worker
    return worker;
  } else {
    // Set a promise that will be resolved when pushWorker is called
    return new Promise<Worker>((resolve) => {
      resolveWorkerPromise = resolve;
    });
  }
}

async function initializeWorker() {
  // Must be a js file, not ts
  const worker = new Worker(
    `${path.resolve(__dirname, '../entry.js')}`, { argv: [ 'prerender-workers/thread' ] }
  );

  // End-of-work callback
  worker.on('message', async(entries: Array<{Id: string, ReceiptHandle: string}>) => {
    console.log(`Deleting ${entries.length} messages`);

    // Delete successfully processed messages from the queue
    await sqsClient.send(new DeleteMessageBatchCommand({
      Entries: entries,
      QueueUrl: process.env.WORK_QUEUE_URL,
    }));

    // The worker is now idle again
    pushWorker(worker);
  });

  // Log errors
  worker.on('error', console.error);
  worker.on('messageerror', console.error);

  // Restart the worker if terminated
  worker.on('exit', (code: number) => {
    if (code === 1) { initializeWorker(); }
  });

  // The worker starts idle
  pushWorker(worker);
}

for (const _undefined of Array(cpus().length + 1)) { initializeWorker(); }

async function work() {
  const receiveMessageCommand = new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    QueueUrl: process.env.WORK_QUEUE_URL,
  });

  console.log(`Bucket: ${process.env.BUCKET_NAME} (${process.env.BUCKET_REGION})`);

  while (true) {
    const worker = await popWorker();

    console.log(`Listening to ${process.env.WORK_QUEUE_URL} for work`);

    const receiveMessageResult = await sqsClient.send(receiveMessageCommand);

    const messages = receiveMessageResult.Messages || [];

    if (messages.length === 0) {
      console.log('Received no messages; waiting 10 seconds to retry');

      pushWorker(worker);

      await new Promise((r) => setTimeout(r, 10000));

      continue;
    }

    // Begin work
    worker.postMessage(messages);

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
