import * as Sentry from '@sentry/browser';
import createSentryMiddleware from 'redux-sentry-middleware';
import config from '../config';

export default {

  initializeWithMiddleware() {
    Sentry.init({
      dist: config.CODE_VERSION,
      dsn: 'https://84d2036467d546038347f0ac9ccd8b3b:c815982d89764df583493a60794e54aa@sentry.cnx.org/17',
      environment: config.DEPLOYED_ENV,
    });
    return createSentryMiddleware(Sentry);
  },

  captureException(error: any) {
    Sentry.captureException(error);
  },

  log(message: string) {
    Sentry.captureMessage(message, Sentry.Severity.Log);
  },

  warn(message: string) {
    Sentry.captureMessage(message, Sentry.Severity.Warning);
  },

  error(message: string) {
    Sentry.captureMessage(message, Sentry.Severity.Error);
  },

};
