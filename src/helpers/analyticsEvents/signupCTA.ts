import { createSelector } from 'reselect';
import * as selectNavigation from '../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const signupCTA = 'signup CTA';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  event: 'open' | 'close' | 'close by navigating'
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: event,
      eventCategory: signupCTA,
      eventLabel: pathname,
    }),
  };
};
