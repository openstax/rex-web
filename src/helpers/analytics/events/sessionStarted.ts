import { sessionStarted } from '@openstax/event-capture-client/events';
import { AppState } from '../../../app/types';
import { AnalyticsEvent } from './event';

export const selector = (_state: AppState) => ({});

export const track = (
  _: ReturnType<typeof selector>,
  referrer: string
): AnalyticsEvent | void => {
  return {
    getEventCapturePayload: () => sessionStarted({referrer}),
  };
};
