import { receiveFeatureFlags } from '../app/featureFlags/actions';
import { receiveMessages, updateAvailable } from '../app/notifications/actions';
import { Messages } from '../app/notifications/types';
import { shouldLoadAppMessage } from '../app/notifications/utils';
import { Store } from '../app/types';
import { assertDocument } from '../app/utils';
import { APP_ENV, RELEASE_ID } from '../config';
import { configureEventCapture } from '../gateways/eventCaptureClient';
import googleAnalyticsClient from '../gateways/googleAnalyticsClient';

/*
 * when a page is initially loaded, the built in release
 * id might legitimately be different from the environment.json
 * release id if a deployment is currently in progress. in order
 * to avoid repeatedly prompting to reload in this case, we wait
 * to actually observe the environment.json release id change
 * before prompting.
 *
 * there is potential to miss the environment.json changing if
 * the window doesn't have focus, so after a bit we can start
 * trusting the release id from environment.json and just compare
 * it to our built one
 */

const pollInterval = 1000 * 60; // 1m
export const trustAfter = 1000 * 60 * 60; // 1h
const pageLoaded = new Date().getTime();
const trustRelease = () => (new Date().getTime()) - pageLoaded > trustAfter;
let previousObservedReleaseId: string | undefined;

export type Cancel = () => void;

interface EnvironmentConfigs {
  quasar_api?: string | undefined;
  google_analytics?: string[] | undefined;
  feature_flags?: string[];
}

interface Environment {
  release_id: string;
  configs: EnvironmentConfigs;
  messages: Messages;
}

const processEnvironment = (store: Store, environment: Environment) => {
  processReleaseId(store, environment);

  if (environment.configs) {
    processGoogleAnalyticsIds(environment.configs);
    processQuasarConfigs(environment.configs);
    processFeatureFlags(store, environment.configs.feature_flags);
  }
  if (environment.messages) {
    processMessages(store, environment.messages.filter(shouldLoadAppMessage));
  }
};

const processReleaseId = (store: Store, environment: Environment) => {
  const releaseId = environment.release_id;

  if (
    (trustRelease() && releaseId !== RELEASE_ID)
    || (previousObservedReleaseId && previousObservedReleaseId !== releaseId)
  ) {
    store.dispatch(updateAvailable());
  }

  previousObservedReleaseId = releaseId;
};

const processQuasarConfigs = (environmentConfigs: EnvironmentConfigs) => {
  if (environmentConfigs.quasar_api === 'default') {
    configureEventCapture();
  } else if (environmentConfigs.quasar_api) {
    configureEventCapture({
      basePath: environmentConfigs.quasar_api,
    });
  }
};

const processGoogleAnalyticsIds = (environmentConfigs: EnvironmentConfigs) => {
  const ids = environmentConfigs.google_analytics;

  if (ids && ids.length > 0) {
    googleAnalyticsClient.setTrackingIds(ids);
  }
};
const processFeatureFlags = (store: Store, featureFlags: string[] = []) => {
  store.dispatch(receiveFeatureFlags(featureFlags));
};
const processMessages = (store: Store, messages: Messages) => {
  store.dispatch(receiveMessages(messages));
};

export const poll = (store: Store) => async() => {
  const environment = await fetch('/rex/environment.json')
    .then((response) => response.json() as Promise<Environment>)
    .catch(() => null)
  ;

  if (environment) {
    processEnvironment(store, environment);
  }
};

export default (store: Store): Cancel => {
  if (APP_ENV === 'test') {
    return () => undefined;
  }

  const handler = poll(store);
  const document = assertDocument();
  let interval: ReturnType<typeof setInterval>;

  const visibilityListener = () => document.visibilityState === 'visible'
    ? activateInterval()
    : clearInterval(interval);

  const cancel = () => {
    document.removeEventListener('visibilitychange', visibilityListener);
    clearInterval(interval);
  };
  const activateInterval = () => {
    interval = setInterval(handler, pollInterval);
    handler();
  };

  activateInterval();
  document.addEventListener('visibilitychange', visibilityListener);

  return cancel;
};
