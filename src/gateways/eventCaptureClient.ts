import { createCaptureContext } from '@openstax/event-capture-client/capture';
import sentry from '../helpers/Sentry';

const {capture, configure} = createCaptureContext({
  reportError: sentry.captureException,
});

export const captureEvent = capture;
export const configureEventCapture = configure;
