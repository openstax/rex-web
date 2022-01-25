// tslint:disable:no-console

/*
  Manages worker threads in a single instance
  Receives messages from the SQS queue, distributes them to worker threads,
  and deletes processed messages from the queue
*/

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
import './logUnhandledRejectionsAndExit';

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
  private resolvePromise: ((receiptHandle: string) => void) | undefined;
  private rejectPromise: ((error: Error) => void) | undefined;

  constructor() {
    console.log('Initializing prerendering worker thread');

    // Must be a js file, not ts
    this.worker = new Worker(
      `${path.resolve(__dirname, '../entry.js')}`, { argv: [ 'prerender/thread' ] }
    );

    // End-of-work callback
    this.worker.on('message', async(receiptHandle: string) => {
      // Pass the receiptHandle back to the main loop
      if (this.resolvePromise) { this.resolvePromise(receiptHandle); }

      // The worker is now idle again
      pushWorker(this);
    });

    // This usually happens if there's a connection error
    this.worker.on('exit', (code: number) => {
      console.log(`Worker thread exited with status code ${code}`);

      if (this.rejectPromise) { this.rejectPromise(new Error(code.toString())); }

      // Start a brand new worker thread if terminated by an error
      if (code !== 0) { pushWorker(new SQSWorker()); }
    });

    // This should not happen as we log unhandled rejections and exit
    // but just in case we missed something, we also log them
    this.worker.on('error', console.error);

    // This would only happen if there were unserializable objects in the worker message JSON
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
// LIFO is the easiest one to implement efficiently with an array
// and we don't really care about the order of the threads

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

// Extends the SQS VisibilityTimeout for the given messages
async function sqsHeartbeat(messages: Message[]) {
  console.log(`Sending SQS heartbeat for ${messages.length} messages`);

  messages.forEach(async(message) => {
    try {
      await sqsClient.send(new ChangeMessageVisibilityCommand({
        QueueUrl: process.env.WORK_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
        VisibilityTimeout: 30,
      }));
    } catch (error) {
      console.error(error.message, error.stack);
      // Even if one message got deleted,
      // we should not abort the work and continue trying to send the heartbeat for the others
    }
  });
}

// Having a few more worker threads than CPUs seemed to help keep CPU utilization high
for (const _undefined of Array(Math.ceil(1.5 * cpus().length))) { pushWorker(new SQSWorker()); }

// Typescript shenanigans so filter() returns the correct type for the return value of allSettled()
// https://stackoverflow.com/a/65479695
type FulfilledPromiseResult<Type> = {
  status: 'fulfilled';
  value: Type;
};
type RejectedPromiseResult = {
  status: 'rejected';
  reason: Error;
};
type PromiseResult<Type> = FulfilledPromiseResult<Type> | RejectedPromiseResult;

function isFulfilledPromiseResult<Type>(
  promiseResult: PromiseResult<Type>
): promiseResult is FulfilledPromiseResult<Type> { return promiseResult.status === 'fulfilled'; }

// ES2020 has Promise.allSettled()
// Adapted from https://github.com/amrayn/allsettled-polyfill/blob/master/index.js
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

function makeHandleSettledPromises(heartbeatInterval: number) {
  return async(results: Array<PromiseResult<string>>) => {
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

      // Nothing to delete, so just return
      return;
    }

    console.log(`Received ${numSuccesses} successes and ${
      numResults - numSuccesses} failures; deleting succesful messages`);

    // Delete only the successful messages
    return sqsClient.send(new DeleteMessageBatchCommand({
      Entries: successfulEntries,
      QueueUrl: process.env.WORK_QUEUE_URL,
    }));
  };
}

async function work() {
  while (true) {
    console.log(`Listening to ${process.env.WORK_QUEUE_URL} for work`);

    const receiveMessageResult = await sqsClient.send(receiveMessageCommand);

    const messages = receiveMessageResult.Messages || [];

    if (messages.length === 0) {
      console.log('Received no messages; waiting 10 seconds to retry');

      await new Promise((r) => setTimeout(r, 10000));

      continue;
    }

    /*
      The VisibilityTimeout for the work queue is fairly short (30 seconds) so errors
      (for example, connection errors) can be retried by another worker without waiting too long.

      However, since some of the index pages take 10 minutes or more to render, the worker has to
      send periodic heartbeats to SQS to keep the VisibilityTimeout for messages that are being
      worked on.
      If the visibility timeout expires, the delete message command won't actually delete the
      message at the end and the build will never finish.

      The SQS heartbeat interval is cleared when all messages in a batch are either rendered or
      error out, allowing the VisibilityTimeout to expire and the errors to be retried by another
      worker.
    */

    // The delay here should be about half of the VisibilityTimeout
    const heartbeatInterval = setInterval(sqsHeartbeat, 15000, messages);

    // Send 1 message to each worker
    // We want to make sure we don't read more messages than we have available workers,
    // so this loop must block when waiting for a worker
    const workPromises: Array<Promise<string>> = [];
    for (const message of messages) {
      // Get an available worker or wait for one
      const worker = await popWorker();

      // Begin work
      workPromises.push(worker.startWork(message));
    }

    const handleSettledPromises = makeHandleSettledPromises(heartbeatInterval);

    // Wait for the work on all messages to be done, then delete the successful ones
    // allSettled() (Promise.allSettled in ES2020) always succeeds and returns an array of objects
    // that specify which promises in the iterable argument succeeded and which failed
    // We use then() instead of await to avoid having to wait for all threads to be done at once
    // This way the threads that are already done can start work on the next 10 messages
    allSettled(workPromises).then(handleSettledPromises);
  }

  // Code here would never be reached, as the loop above never terminates
}

work();
