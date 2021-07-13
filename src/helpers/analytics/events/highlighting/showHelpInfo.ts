import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const showHelpInfo = 'REX highlighting - show help info on mobile';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: 'show help info',
      eventCategory: showHelpInfo,
      eventLabel: pathname,
    }),
  };
};
