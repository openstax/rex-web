// Disable page focus tracking https://github.com/openstax/unified/issues/1313
/* istanbul ignore file */

import { createSelector } from 'reselect';
import * as selectNavigation from '../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const eventName = 'REX page focus';

export const selector = createSelector(
  selectNavigation.pathname,
  // Disable page focus tracking https://github.com/openstax/unified/issues/1313
  /* istanbul ignore next */
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  focused: boolean
): AnalyticsEvent | void => {
  // Disable page focus tracking https://github.com/openstax/unified/issues/1313
  /* istanbul ignore next */
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: focused ? 'focused' : 'unfocused',
      eventCategory: eventName,
      eventLabel: pathname,
      nonInteraction: true,
    }),
  };
};
