import { HTMLElement } from '@openstax/types/lib.dom';
import { findFirstAncestorOrSelf } from '../../../app/domUtils';
import { FirstArgumentType } from '../../../app/types';
import { captureEvent } from '../../../gateways/eventCaptureClient';
import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';

export const getAnalyticsRegion = (element: HTMLElement) => {
  const region = findFirstAncestorOrSelf(element, (el) => !!el.getAttribute('data-analytics-region'));

  if (region) {
    return region.getAttribute('data-analytics-region');
  }
};

export interface AnalyticsEvent {
  getGoogleAnalyticsPayload?: () => FirstArgumentType<GoogleAnalyticsClient['trackEventPayload']>;
  getEventCapturePayload?: () => FirstArgumentType<typeof captureEvent>;
}
