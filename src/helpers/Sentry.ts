import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import createSentryMiddleware from 'redux-sentry-middleware';
import { recordSentryMessage } from '../app/errors/actions';
import { Middleware, MiddlewareAPI } from '../app/types';
import config from '../config';

let IS_INITIALIZED = false;

export const onBeforeSend = (store: MiddlewareAPI) => (event: Sentry.Event) => {
  const { event_id } = event;

  if (event_id)  {
    store.dispatch(recordSentryMessage(event_id));
  }

  return event;
};

export const Severity = Sentry.Severity;

export default {

  initializeWithMiddleware(): Middleware {
    return (store) => {
      Sentry.init({
        beforeSend: onBeforeSend(store),
        dist: config.RELEASE_ID,
        dsn: 'https://d2a5f17c9d8f40369446ea0cfaf21e73@o484761.ingest.sentry.io/5538506',
        environment: config.DEPLOYED_ENV,
        integrations: [
          new Integrations.ExtraErrorData(),
          new Integrations.CaptureConsole(),
          new Integrations.Dedupe(),
        ],
        release: `rex@${config.RELEASE_ID}`,
        tracesSampleRate: 0.1,
      });
      IS_INITIALIZED = true;

      return createSentryMiddleware(Sentry)(store);
    };
  },

  get isEnabled() {
    return IS_INITIALIZED && config.SENTRY_ENABLED;
  },

  get shouldCollectErrors() {
    return typeof(window) !== 'undefined' && config.SENTRY_ENABLED;
  },

  captureException(error: any, level: Sentry.Severity = Severity.Error) {
    if (this.isEnabled) {
      Sentry.withScope((scope) => {
        scope.setLevel(level);
        Sentry.captureException(error);
      });
    } else if (!this.shouldCollectErrors) {
      console.error(error); // tslint:disable-line:no-console
    }
  },

  captureMessage(message: string, level: Sentry.Severity) {
    if (this.isEnabled) {
      Sentry.captureMessage(message, level);
    }
  },

  log(message: string) {
    this.captureMessage(message, Severity.Log);
  },

  warn(message: string) {
    this.captureMessage(message, Severity.Warning);
  },

  error(message: string) {
    this.captureMessage(message, Severity.Error);
  },

};
