import { createCaptureContext } from '@openstax/event-capture-client';
import sentry from '../helpers/Sentry';

export const captureEvent = createCaptureContext({
  batchInterval: 1000,
  reportError: sentry.captureException,
});
