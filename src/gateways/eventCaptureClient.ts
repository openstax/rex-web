import { createCaptureContext } from '@openstax/event-capture-client/capture';
import { trackingIsDisabled } from '../helpers/analytics';
import sentry from '../helpers/Sentry';

const {capture, configure, queue} = createCaptureContext({
  reportError: sentry.captureException,
  sendingEnabled: () => !trackingIsDisabled(),
});

export const captureQueue = queue;
export const captureEvent = capture;
export const configureEventCapture = configure;
