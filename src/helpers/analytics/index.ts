import { useSelector } from 'react-redux';
import { useServices } from '../../app/context/Services';
import { findFirstAncestorOrSelfOfType } from '../../app/domUtils';
import { Store } from '../../app/types';
import * as eventCaptureClient from '../../gateways/eventCaptureClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { events } from './bindEvents';
import { addInteractiveListeners } from './utils';

export * from './utils';

export const registerGlobalAnalytics = (window: Window, store: Store) => {
  const document = window.document;

  events.sessionStarted.track(events.sessionStarted.selector(store.getState()));
  events.pageFocus.track(events.pageFocus.selector(store.getState()), document);

  window.addEventListener('beforeunload', () => {
    events.unload.track(events.unload.selector(store.getState()));
  });

  document.addEventListener('visibilitychange', () => {
    events.pageFocus.track(events.pageFocus.selector(store.getState()), document);
  });

  addInteractiveListeners(window, (element, stateChange) => {
    events.elementInteracted.track(events.elementInteracted.selector(store.getState()), element, stateChange);
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

  return {googleAnalyticsClient, eventCaptureClient, events};
};

export const useAnalyticsEvent = <T extends keyof typeof events>(eventType: T) => {
  // the types in here are horrible, probably because of:
  // https://github.com/Microsoft/TypeScript/issues/13995
  // but the returned function has the correct args so whatever
  const services = useServices();
  const event = services.analytics[eventType];
  const data = useSelector(event.selector);

  type E = typeof services['analytics'][T];
  type RemainingArgumentTypes = E['track'] extends (
    d: ReturnType<E['selector']>,
    ...args: infer A
  ) => unknown
    ? A
    : never;

  return (...args: RemainingArgumentTypes) => {
    (event.track as (...args: unknown[]) => void)(data, ...args);
  };
};

export default events;
