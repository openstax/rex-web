import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const closeSG = 'REX Study guides (close SG popup)';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({
    pathname,
  })
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  closeMethod: 'esc' | 'overlay' | 'button'
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: closeMethod as string,
      eventCategory: closeSG,
      eventLabel: pathname,
    }),
  };
};
