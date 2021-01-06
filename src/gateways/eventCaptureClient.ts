import { createCaptureContext } from '@openstax/event-capture-client/capture';
import sentry from '../helpers/Sentry';

export const captureEvent = createCaptureContext({
  reportError: sentry.captureException,
});
