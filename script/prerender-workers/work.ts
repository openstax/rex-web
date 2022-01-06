// tslint:disable:no-console

/*
  Manages worker threads in a single instance
  Receives messages from the SQS queue, distributes them to worker threads,
  and deletes processed messages from the queue
*/

import './setup';

import {
  ChangeMessageVisibilityCommand,
  DeleteMessageBatchCommand,
  DeleteMessageBatchRequestEntry,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { cpus } from 'os';
import path from 'path';
import { Worker } from 'worker_threads';

console.log(`Bucket: ${process.env.BUCKET_NAME} (${process.env.BUCKET_REGION})`);

console.log('Initializing SQS client');

const sqsClient = new SQSClient({ region: process.env.WORK_REGION });

const receiveMessageCommand = new ReceiveMessageCommand({
  MaxNumberOfMessages: 10,
  QueueUrl: process.env.WORK_QUEUE_URL,
});

// We wrap the worker class instead of extending,
// because trying to extend a native class leads to a Babel error
class SQSWorker {
  private worker: Worker;
  private interval: number | null = null;

  constructor() {
    console.log('Initializing worker thread');

    // Must be a js file, not ts
    this.worker = new Worker(
      `${path.resolve(__dirname, '../entry.js')}`, {
        argv: [ 'prerender-workers/thread' ],
        execArgv: [ ...process.execArgv, '--unhandled-rejections=strict' ],
      }
    );

    // End-of-work callback
    this.worker.on('message', async(entries: DeleteMessageBatchRequestEntry[]) => {
      try {
        console.log(`Deleting ${entries.length} messages`);

        // Stop the SQS heartbeat
        this.endWork();

        // Delete successfully processed messages from the queue
        await sqsClient.send(new DeleteMessageBatchCommand({
          Entries: entries,
          QueueUrl: process.env.WORK_QUEUE_URL,
        }));

        // The worker is now idle again
        pushWorker(this);
      } catch (e) {
        // Error on the main thread; Stop the whole container and let someone else retry
        console.error(e.message, e.stack);
        process.exit(1);
      }
    });

    // This usually happens if there's a connection error
    this.worker.on('exit', (code: number) => {
      try {
        console.log(`Worker thread exited with status code ${code}`);

        this.endWork();

        // Restart the worker if terminated by an error
        if (code !== 0) { pushWorker(new SQSWorker()); }
      } catch (e) {
        // Error on the main thread; Stop the whole container and let someone else retry
        console.error(e.message, e.stack);
        process.exit(1);
      }
    });

    // These should not happen as we try to catch the errors and exit(1) instead,
    // but just in case we missed something, we log them
    this.worker.on('error', console.error);
    this.worker.on('messageerror', console.error);
  }

  public startWork(messages: Message[]) {
    // Configure the SQS heartbeat
    this.interval = setInterval(this.sqsHeartbeat, 15000, messages);

    // Begin work on a separate thread
    this.worker.postMessage(messages);
  }

  protected endWork() {
    // Stop the SQS heartbeat
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  protected async sqsHeartbeat(messages: Message[]) {
    console.log(`Sending SQS hearbeat for ${messages.length} messages`);

    for (const message of messages) {
      try {
        await sqsClient.send(new ChangeMessageVisibilityCommand({
          QueueUrl: process.env.WORK_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
          VisibilityTimeout: 30,
        }));
      } catch (e) {
        console.error(e.message, e.stack);
        // Even if one message got deleted,
        // we should continue trying to send the heartbeat for the others
      }
    }
  }
}

// Idle worker thread (LIFO) queue
// It only supports 1 waiter at a time but that is all we need

const idleWorkers: SQSWorker[] = [];

let resolveWorkerPromise: ((worker: SQSWorker) => void) | null;

function pushWorker(worker: SQSWorker) {
  if (resolveWorkerPromise) {
    console.log('Main thread already waiting for worker thread; sending it directly');

    // Someone is waiting for the worker, so resolve the promise rather than adding it to the queue
    resolveWorkerPromise(worker);
    resolveWorkerPromise = null;
  } else {
    console.log('Main thread not ready yet; adding worker thread to idle worker queue');

    // Add the idle worker to the queue
    idleWorkers.push(worker);
  }
}

async function popWorker() {
  // Check if an idle worker is available
  const worker = idleWorkers.pop();

  if (worker) {
    console.log('Main thread got worker thread from idle worker queue');

    return worker;
  } else {
    console.log('All worker threads busy; main thread waiting for available worker thread');

    // Set a promise that will be resolved when pushWorker is called
    return new Promise<SQSWorker>((resolve) => {
      resolveWorkerPromise = resolve;
    });
  }
}

for (const _undefined of Array(cpus().length + 1)) { pushWorker(new SQSWorker()); }

async function work() {
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
    worker.startWork(messages);

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
