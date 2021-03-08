import { createSelector } from 'reselect';
import * as selectNavigation from '../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const nudge = 'Nudge Study Tools';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = ({pathname}: ReturnType<typeof selector>): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: 'open',
      eventCategory: nudge,
      eventLabel: pathname,
    }),
  };
};
