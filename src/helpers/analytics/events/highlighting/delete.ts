import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const deleteHighlight = 'REX highlighting (delete-inline-highlight)';
const deleteHighlightMH = 'REX highlighting (delete-highlight) - MH popup';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  color: string,
  isMH?: boolean
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: color,
      eventCategory: isMH ? deleteHighlightMH : deleteHighlight,
      eventLabel: pathname,
    }),
  };
};
