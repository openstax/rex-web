import { createCaptureContext } from '@openstax/event-capture-client/capture';
import { trackingIsDisabled } from '../helpers/analytics';
import sentry from '../helpers/Sentry';
import { not } from "../app/fpUtils";

const {capture, configure, queue} = createCaptureContext({
  initialized: false,
  reportError: sentry.captureException,
  sendingEnabled: not(trackingIsDisabled),
});

export const captureQueue = queue;
export const captureEvent = capture;
export const configureEventCapture = configure;
