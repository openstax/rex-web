import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { useServices } from '../../app/context/Services';
import { findFirstAncestorOrSelfOfType } from '../../app/domUtils';
import { Store } from '../../app/types';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { events } from './bindEvents';

export const registerGlobalAnalytics = (window: Window, store: Store) => {
  const document = window.document;

  events.sessionStarted.track(events.sessionStarted.selector(store.getState()));

  window.addEventListener('beforeunload', () => {
    events.unload.track(events.unload.selector(store.getState()));
  });

  document.addEventListener('click', (e) => {
    if (!e.target || !(e.target instanceof window.Node)) {
      return;
    }

    const anchor = findFirstAncestorOrSelfOfType(e.target, window.HTMLAnchorElement);
    if (anchor) {
      events.clickLink.track(events.clickLink.selector(store.getState()), anchor);
    }

    const button = findFirstAncestorOrSelfOfType(e.target, window.HTMLButtonElement);
    if (button) {
      const disableTrack = button.getAttribute('data-analytics-disable-track');
      if ( disableTrack ) {
        return;
      }
      events.clickButton.track(events.clickButton.selector(store.getState()), button);
    }
  });

  window.matchMedia('print').addListener((mql) => {
    if (mql.matches) {
      events.print.track(events.print.selector(store.getState()));
    }
  });

  googleAnalyticsClient.setCustomDimensionForSession();

  return {googleAnalyticsClient, events};
};

export const useAnalyticsEvent = <T extends keyof typeof events>(eventType: T) => {
  // the types in here are horrible, probably because of:
  // https://github.com/Microsoft/TypeScript/issues/13995
  // but the returned function has the correct args so whatever
  const services = useServices();
  const event = services.analytics[eventType];
  const data = useSelector(event.selector as any);

  type E = typeof services['analytics'][T];
  type RemainingArgumentTypes = E['track'] extends (d: ReturnType<E['selector']>, ...args: infer A) => any ? A : never;

  return (...args: RemainingArgumentTypes) => {
    (event.track as any)(data, ...args);
  };
};

export default events;

const disableAnalyticsCookie = 'ANALYTICS_OPT_OUT';

export const trackingIsDisabled = () => !!Cookies.get(disableAnalyticsCookie);
