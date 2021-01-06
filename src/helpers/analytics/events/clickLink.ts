import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent, getAnalyticsRegion } from './event';

const baseName = 'REX Link';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  anchor: HTMLAnchorElement
): AnalyticsEvent | void => {
  const region = getAnalyticsRegion(anchor);
  const href = anchor.getAttribute('data-analytics-label') || anchor.getAttribute('href');

  if (!href) {
    return;
  }

  return {
    getGoogleAnalyticsPayload: () => {
      const eventCategory = region
        ? `${baseName} (${region})`
        : baseName;

      return {
        eventAction: href,
        eventCategory,
        eventLabel: pathname,
      };

    },
  };
};
