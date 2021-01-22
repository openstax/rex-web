import { HTMLElement } from '@openstax/types/lib.dom';
import { findFirstAncestorOrSelf } from '../../app/domUtils';
import { FirstArgumentType } from '../../app/types';
import { GoogleAnalyticsClient } from '../../gateways/googleAnalyticsClient';

export const getAnalyticsRegion = (element: HTMLElement) => {
  const region = findFirstAncestorOrSelf(element, (el) => !!el.getAttribute('data-analytics-region'));

  if (region) {
    return region.getAttribute('data-analytics-region');
  }
};

export const getAnalyticsLocation = (element: HTMLElement) => {
  const location = findFirstAncestorOrSelf(element, (el) => !!el.getAttribute('data-analytics-location'));

  if (location) {
    return location.getAttribute('data-analytics-location');
  }
};

export interface AnalyticsEvent {
  getGoogleAnalyticsPayload?: () => FirstArgumentType<GoogleAnalyticsClient['trackEventPayload']>;
}
