import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const editNote = 'REX highlighting (inline edit)';
const editNoteMH = 'REX highlighting (edit) - MH popup';

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
      eventCategory: isMH ? editNoteMH : editNote,
      eventLabel: pathname,
    }),
  };
};
