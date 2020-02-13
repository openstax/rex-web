import { createSelector } from 'reselect';
import * as selectNavigation from '../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const eventName = 'REX page focus';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  focused: boolean
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: focused ? 'focused' : 'unfocused',
      eventCategory: eventName,
      eventLabel: pathname,
      nonInteraction: true,
    }),
  };
};
