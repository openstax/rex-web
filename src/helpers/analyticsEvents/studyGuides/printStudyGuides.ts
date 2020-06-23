import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const eventName = 'REX Study guides (print SG)';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: 'print study guides',
      eventCategory: eventName,
      eventLabel: pathname,
    }),
  };
};
