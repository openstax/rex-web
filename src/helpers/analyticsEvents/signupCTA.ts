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
  open: boolean
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: open ? 'open' : 'close by navigating',
      eventCategory: signupCTA,
      eventLabel: pathname,
    }),
  };
};
