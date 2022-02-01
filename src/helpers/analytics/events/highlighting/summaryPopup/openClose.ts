import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../../event';

const open = 'REX highlighting (open MH popup)';
const close = 'REX highlighting (close MH popup)';

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
