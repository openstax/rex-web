import * as Sentry from '@sentry/react';
import * as Integrations from '@sentry/integrations';
import { recordSentryMessage } from '../app/errors/actions';
import { Middleware, MiddlewareAPI } from '../app/types';
import config from '../config';

let IS_INITIALIZED = false;

// This should be removed when Sentry team solve this issue: https://github.com/getsentry/sentry/issues/16012
const normalize = (id: string): string => id.replace('/', '-');

export const onBeforeSend = (store: MiddlewareAPI) => (event: Sentry.Event) => {
  const { event_id } = event;

  if (event_id)  {
    store.dispatch(recordSentryMessage(event_id));
  }

  return event;
};

export default {

  initializeWithMiddleware(): Middleware {
    return (store) => {
      Sentry.init({
        allowUrls: [
          /localhost/,
          /openstax.org/,
          /https?:\/\/rex-web(.*)?\.herokuapp\.com/,
        ],
        beforeSend: onBeforeSend(store),
        dist: normalize(config.RELEASE_ID),
        dsn: 'https://d2a5f17c9d8f40369446ea0cfaf21e73@o484761.ingest.sentry.io/5538506',
        environment: config.DEPLOYED_ENV,
        integrations: [
          new Integrations.ExtraErrorData(),
          new Integrations.Dedupe(),
        ],
        release: normalize(`rex@${config.RELEASE_ID}`),
        tracesSampleRate: 0.1,
      });
      IS_INITIALIZED = true;

      return next => action => {
        return next(action)
      };
    };
  },

  createReduxEnhancer() {
    return Sentry.createReduxEnhancer({});
  },

  get isEnabled() {
    return IS_INITIALIZED && config.SENTRY_ENABLED;
  },

  get shouldCollectErrors() {
    return typeof(window) !== 'undefined' && config.SENTRY_ENABLED;
  },

  captureException(error: any, level: Sentry.SeverityLevel = 'error') {
    if (!error) {
      return;
    }

    if (this.isEnabled) {
      return Sentry.captureException(error, { level });
    } else if (!this.shouldCollectErrors) {
      switch (level) {
        case 'info':
          console.info(error instanceof Error ? error.message : error); // tslint:disable-line:no-console
          break;
        case 'warning':
          console.warn(error instanceof Error ? error.message : error); // tslint:disable-line:no-console
          break;
        default:
          console.error(error); // tslint:disable-line:no-console
      }
    }
  },

  captureMessage(message: string, level: Sentry.SeverityLevel) {
    if (this.isEnabled) {
      Sentry.captureMessage(message, level);
    }
  },

  log(message: string) {
    this.captureMessage(message, 'log');
  },

  warn(message: string) {
    this.captureMessage(message, 'warning');
  },

  error(message: string) {
    this.captureMessage(message, 'error');
  },

};
