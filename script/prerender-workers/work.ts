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
  private resolvePromise: ((receiptHandle: string) => void) | null = null;
  private rejectPromise: ((error: Error) => void) | null = null;

  constructor() {
    console.log('Initializing prerendering worker thread');

    // Must be a js file, not ts
    this.worker = new Worker(
      `${path.resolve(__dirname, '../entry.js')}`, {
        argv: [ 'prerender-workers/thread' ],
        execArgv: [ ...process.execArgv, '--unhandled-rejections=strict' ],
      }
    );

    // End-of-work callback
    this.worker.on('message', async(receiptHandle: string) => {
      try {
        // Pass the receiptHandle back to the main loop
        if (this.resolvePromise) { this.resolvePromise(receiptHandle); }

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

        if (this.rejectPromise) { this.rejectPromise(new Error(code.toString())); }

        // Start a brand new worker thread if terminated by an error
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

  public async startWork(message: Message) {
    // This promise will be resolved when the worker is done
    const promise = new Promise<string>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    // Begin work on a separate thread
    this.worker.postMessage(message);

    return promise;
  }
}

// Idle worker thread (LIFO) queue
// LIFO is cheaper in complexity and we don't really care about the order of the rendering

const idleWorkers: SQSWorker[] = [];
const resolveWorkerPromises: Array<(worker: SQSWorker) => void> = [];

function pushWorker(worker: SQSWorker) {
  // Check if someone is already waiting for a worker
  const resolveWorkerPromise = resolveWorkerPromises.pop();

  if (resolveWorkerPromise) {
    // console.log('Main thread already waiting for worker thread; sending it directly');

    resolveWorkerPromise(worker);
  } else {
    // console.log('Main thread not ready yet; adding worker thread to idle worker queue');

    idleWorkers.push(worker);
  }
}

async function popWorker() {
  // Check if an idle worker is available
  const worker = idleWorkers.pop();

  if (worker) {
    // console.log('Main thread got worker thread from idle worker queue');

    return worker;
  } else {
    // console.log('All worker threads busy; main thread waiting for available worker thread');

    // Return a promise that will be resolved when pushWorker is called
    return new Promise<SQSWorker>((resolve) => { resolveWorkerPromises.push(resolve); });
  }
}

async function sqsHeartbeat(messages: Message[]) {
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

for (const _undefined of Array(cpus().length + 1)) { pushWorker(new SQSWorker()); }

// Typescript shenanigans so filter() returns the correct type for the return value of allSettled()
// https://stackoverflow.com/a/65479695
interface FulfilledPromiseResult<Type> {
  status: 'fulfilled';
  value: Type;
}
interface RejectedPromiseResult {
  status: 'rejected';
  reason: Error;
}
function isFulfilledPromiseResult<Type>(
  promiseResult: FulfilledPromiseResult<Type> | RejectedPromiseResult
): promiseResult is FulfilledPromiseResult<Type> { return promiseResult.status === 'fulfilled'; }

// https://github.com/amrayn/allsettled-polyfill/blob/master/index.js
function allSettled<Type>(promises: Array<Promise<Type>>) {
  return Promise.all(
    promises.map(
      (p) => p.then(
        (value: Type) => ({ status: 'fulfilled', value } as FulfilledPromiseResult<Type>)
      ).catch(
        (reason: Error) => ({ status: 'rejected', reason } as RejectedPromiseResult)
      )
    )
  );
}

async function work() {
  while (true) {
    // Make sure we have at least 1 worker available before we listen to the queue
    let worker: SQSWorker | null = await popWorker();

    console.log(`Listening to ${process.env.WORK_QUEUE_URL} for work`);

    const receiveMessageResult = await sqsClient.send(receiveMessageCommand);

    const messages = receiveMessageResult.Messages || [];

    if (messages.length === 0) {
      console.log('Received no messages; waiting 10 seconds to retry');

      pushWorker(worker);

      await new Promise((r) => setTimeout(r, 10000));

      continue;
    }

    // The delay here should be about half of the VisibilityTimeout
    const heartbeatInterval = setInterval(sqsHeartbeat, 15000, messages);

    const workPromises = messages.map(async(message) => {
      // Used from the second iteration onwards
      if (!worker) { worker = await popWorker(); }

      // Begin work
      const workPromise = worker.startWork(message);

      // The next iteration should receive a different worker
      worker = null;

      return workPromise;
    });

    // Wait for the work on all messages to be done
    const results = await allSettled(workPromises);

    // Stop the heartbeat interval
    clearInterval(heartbeatInterval);

    // Check which messages succeeded
    // The Id only has to be unique within this request, it has no other meaning
    const successfulEntries = results.filter(isFulfilledPromiseResult).map(
      (result, index) => ({ Id: index.toString(), ReceiptHandle: result.value })
    );

    const numSuccesses = successfulEntries.length;
    const numResults = results.length;

    if (numSuccesses === 0) {
      console.log(`Received ${numResults} failures and no successes`);

      continue;
    }

    console.log(`Received ${numSuccesses} successes and ${
      numResults - numSuccesses} failures; deleting succesful messages`);

    // Delete only the successful messages
    // The Id only has to be unique within this request, it has no other meaning
    await sqsClient.send(new DeleteMessageBatchCommand({
      Entries: successfulEntries,
      QueueUrl: process.env.WORK_QUEUE_URL,
    }));

    // Queue up the sitemaps for processing elsewhere
    /* TODO: sitemap
    const sendMessageBatchResult = await sqsClient.send(new SendMessageBatchCommand({
      QueueUrl: process.env.SITEMAP_QUEUE_URL,
      Entries: sitemaps.map((sitemap, index) => (
        {Id: index.toString(), MessageBody: JSON.stringify(sitemap)}
      )),
    }));*/
  }

  // Code here would never be reached, as the loop above never terminates
}

work().catch((e) => {
  console.error(e.message, e.stack);
  process.exit(1);
});
