import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const open = 'REX Study guides (open SG popup)';
const close = 'REX Study guides (close SG popup)';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  closeAction?: string
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: closeAction ? closeAction : 'button',
      eventCategory: closeAction ? close : open,
      eventLabel: pathname,
    }),
  };
};
