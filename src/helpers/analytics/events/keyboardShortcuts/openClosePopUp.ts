import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const openPQ = 'REX Keyboard Shortcuts Menu (open KS popup)';
const closePQ = 'REX Keyboard Shortcuts Menu (close KS popup)';

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
      eventCategory: closeAction ? closePQ : openPQ,
      eventLabel: pathname,
    }),
  };
};
