import { HTMLInputElement } from '@openstax/types/lib.dom';
import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent, getAnalyticsRegion } from './event';

const baseName = 'REX Input';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  input: HTMLInputElement
): AnalyticsEvent | void => {
  const region = getAnalyticsRegion(input);
  const label = input.getAttribute('data-analytics-label') || input.getAttribute('aria-label') || input.value;

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
        eventLabel: pathname,
      };
    },
  };
};
