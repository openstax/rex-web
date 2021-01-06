import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const createNote = 'REX highlighting (inline create)';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  color: string
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: color,
      eventCategory: createNote,
      eventLabel: pathname,
    }),
  };
};
