import { createCaptureContext } from '@openstax/event-capture-client/capture';
import { not } from '../app/fpUtils';
import { trackingIsDisabled } from '../helpers/analytics/utils';
import sentry from '../helpers/Sentry';

const {capture, configure, queue} = createCaptureContext({
  initialized: false,
  reportError: sentry.captureException,
  sendingEnabled: not(trackingIsDisabled),
});

export const captureQueue = queue;
export const captureEvent = capture;
export const configureEventCapture = configure;
