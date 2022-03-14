import { HTMLButtonElement } from '@openstax/types/lib.dom';
import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent, getAnalyticsLocation, getAnalyticsRegion } from './event';

const baseName = 'REX Button';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  anchor: HTMLButtonElement
): AnalyticsEvent | void => {
  const region = getAnalyticsRegion(anchor);
  const location = getAnalyticsLocation(anchor);
  const label = anchor.getAttribute('data-analytics-label');

  if (!label) {
    return;
  }

  return {
    getGoogleAnalyticsPayload: () => {
      const eventCategory = region
        ? `${baseName} (${region})`
        : baseName;

      return {
        eventAction: label,
        eventCategory,
        eventLabel: location || pathname,
      };
    },
  };
};
