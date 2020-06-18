import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const openSG = 'REX Study guides (open SG popup)';
const openColorKey = 'REX Study guides (open color key)';
const closeSG = 'REX Study guides (close SG popup)';
const closeColorKey = 'REX Study guides (close color key)';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  closeAction?: string,
  colorKey?: boolean
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: closeAction ? closeAction : 'button',
      eventCategory: closeAction ? (colorKey ? closeColorKey : closeSG) : (colorKey ? openColorKey : openSG),
      eventLabel: pathname,
    }),
  };
};
