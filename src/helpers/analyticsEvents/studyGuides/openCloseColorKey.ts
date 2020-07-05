import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const openText = 'REX Study guides (open color key)';
const closeText = 'REX Study guides (close color key)';

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
      eventAction: 'button',
      eventCategory: open ? openText : closeText,
      eventLabel: pathname,
    }),
  };
};
