import { sessionStarted } from '@openstax/event-capture-client/events';
import { AppState } from '../../../app/types';
import { RELEASE_ID } from '../../../config';
import { AnalyticsEvent } from './event';

export const selector = (_state: AppState) => ({});

export const track = (
  _: ReturnType<typeof selector>
): AnalyticsEvent | void => {
  return {
    getEventCapturePayload: () => sessionStarted({releaseId: RELEASE_ID}),
  };
};
