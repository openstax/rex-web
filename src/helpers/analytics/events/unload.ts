import { stateChange } from '@openstax/event-capture-client/events';
import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const eventName = 'REX unload';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>
): AnalyticsEvent | void => {
  return {
    getEventCapturePayload: () => stateChange({
      current: 'none',
      stateType: 'visibility',
    }),
    getGoogleAnalyticsPayload: () => ({
      eventAction: 'unload',
      eventCategory: eventName,
      eventLabel: pathname,
      nonInteraction: true,
    }),
  };
};
