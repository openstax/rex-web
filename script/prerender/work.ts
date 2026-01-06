
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
import { assertDefined } from '../../src/app/utils';
import './logUnhandledRejectionsAndExit';

// Thread timeout = MAX_HEARTBEATS * 15 seconds
// The timeout must be long enough to render the slowest page, otherwise builds will never finish
const MAX_HEARTBEATS = 20;

console.log(`Bucket: ${process.env.BUCKET_NAME} (${process.env.BUCKET_REGION})`);

console.log('Initializing SQS client');

const sqsClient = new SQSClient({ region: process.env.WORK_REGION });

const receiveMessageCommand = new ReceiveMessageCommand({
  MaxNumberOfMessages: 10,
  QueueUrl: process.env.WORK_QUEUE_URL,
});

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

function isFulfilledPromiseResult<Type>(
  promiseResult: PromiseResult<Type>
): promiseResult is FulfilledPromiseResult<Type> { return promiseResult.status === 'fulfilled'; }

// Changes the SQS VisibilityTimeout for the given ReceiptHandles to the given number of seconds
async function changeReceiptHandlesVisibility(receiptHandles: string[], visibilityTimeout: number) {
  // We use Promise.allSettled() here to prevent failing all messages
  // in case one or more messages have already been deleted by other workers
  return allSettled(
    receiptHandles.map(async(receiptHandle) => sqsClient.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: process.env.WORK_QUEUE_URL,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: visibilityTimeout,
      })
    ))
  );
}

// To be used with setInterval() with a delay of around 15000
// Extends the SQS VisibilityTimeout for the given Message ReceiptHandles
// We keep the VisibilityTimeout low to ensure messages can be quickly
// picked up by other workers if this worker crashes
// We limit the maximum number of heartbeats so messages will eventually timeout, become visible,
// and be picked up by a different worker if one of our threads gets stuck
function makeSQSHeartbeat(receiptHandles: string[]) {
  let numHeartbeats = 0;

  return async() => {
    numHeartbeats += 1;

    if (numHeartbeats > MAX_HEARTBEATS) {
      // We don't currently track which threads are processing this batch or other batches,
      // so we just stop sending the heartbeat and log the error,
      // but make no attempt to interrupt any of them
      console.error(
        `Did not finish processing ${receiptHandles.length} messages within ${
        MAX_HEARTBEATS} heartbeats (current: #${numHeartbeats})`
      );
    } else {
      console.log(`Sending SQS heartbeat #${numHeartbeats} for ${receiptHandles.length} messages`);

      return changeReceiptHandlesVisibility(receiptHandles, 30);
    }
  };
}

// Starts the SQS heartbeat interval
// Returns a callback to be called when all work promises have settled that will cancel the
// heartbeat interval, delete successful messages and force failed messages to become visible
function handleSQSMessages(messages: Message[]) {
  const receiptHandles = messages.map((message) => assertDefined(
    message.ReceiptHandle,
    '[SQS] [ReceiveMessage] Unexpected response: message missing ReceiptHandle key'
  ));

  const sqsHeartbeat = makeSQSHeartbeat(receiptHandles);
  const heartbeatInterval = setInterval(sqsHeartbeat, 15000);

  return async(results: Array<PromiseResult<string>>) => {
    // Stop sending SQS heartbeats
    clearInterval(heartbeatInterval);

    // Check which messages succeeded
    const successfulHandles = results.filter(isFulfilledPromiseResult).map((res) => res.value);

    const numSuccesses = successfulHandles.length;
    const numFailures = results.length - numSuccesses;

    console.log(`Result: ${numSuccesses} successes and ${numFailures} failures`);

    if (numSuccesses > 0) {
      // Delete only the successful messages
      // The Id only has to be unique within this request, it has no other meaning
      const successfulEntries = successfulHandles.map(
        (handle, index) => ({ Id: index.toString(), ReceiptHandle: handle })
      );

      await sqsClient.send(new DeleteMessageBatchCommand({
        Entries: successfulEntries,
        QueueUrl: process.env.WORK_QUEUE_URL,
      }));
    }

    if (numFailures > 0) {
      // Mark failures as visible so another worker can immediately retry them without waiting
      // Since we don't get values from rejected promises, we compute the array difference instead
      // For larger arrays, creating Sets and using Set.has() would be faster,
      // but since these arrays have at most 10 elements, Array.includes() wins here
      const failedHandles = receiptHandles.filter((handle) => !successfulHandles.includes(handle));

      await changeReceiptHandlesVisibility(failedHandles, 0);
    }
  };
}

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

    // This should not happen as the thread run() function is async and we log unhandled rejections
    // and exit, but it's here just in case we make changes in the future and miss something
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
// LIFO is the easiest one to implement efficiently with arrays
// and we don't really care about the order of the threads

const idleWorkers: SQSWorker[] = [];
const resolveWorkerPromises: Array<(worker: SQSWorker) => void> = [];

function pushWorker(worker: SQSWorker) {
  // Check if someone is already waiting for a worker
  const resolveWorkerPromise = resolveWorkerPromises.pop();

  if (resolveWorkerPromise) {
    // Main thread already waiting for worker thread; sending it directly
    resolveWorkerPromise(worker);
  } else {
    // Main thread not ready yet; adding worker thread to idle worker queue
    idleWorkers.push(worker);
  }
}

async function popWorker() {
  // Check if an idle worker is available
  const worker = idleWorkers.pop();

  if (worker) {
    // Main thread gets worker thread directly from the idle worker queue
    return worker;
  } else {
    // All worker threads busy; main thread waiting for available worker thread
    // Return a promise that will be resolved when pushWorker is called
    return new Promise<SQSWorker>((resolve) => { resolveWorkerPromises.push(resolve); });
  }
}

// Having a few more worker threads than CPUs seemed to help keep CPU utilization high
for (const _undefined of Array(Math.ceil(1.5 * cpus().length))) { pushWorker(new SQSWorker()); }

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

    // Handles SQS operational details, like heartbeats, deleting messages, and message visibility
    // Returns a callback to be executed after all work promises have settled
    const handleSettledPromises = handleSQSMessages(messages);

    // We want to make sure we don't read more messages than we have available workers,
    // so this loop must block when waiting for a worker (cannot use messages.map())
    const workPromises: Array<Promise<string>> = [];
    for (const message of messages) {
      // Get an available worker or wait for one
      const worker = await popWorker();

      // Send 1 message to each worker
      workPromises.push(worker.startWork(message));
    }

    // allSettled() (Promise.allSettled() in ES2020) always succeeds and returns an array of objects
    // that specify which promises in the iterable argument succeeded and which failed
    // We use then() instead of await to avoid having to wait for all threads to be done at once
    // This way the threads that are already done can start work on the next 10 messages
    allSettled(workPromises).then(handleSettledPromises);
  }

  // Code here would be unreachable, as the loop above never terminates
}

work();
