import * as Sentry from '@sentry/browser';
import { Middleware } from 'redux';
import createSentryMiddleware from 'redux-sentry-middleware';
import config from '../config';

const emptyMiddleWare: Middleware = () => (next) => (action) => {
  next(action);
};

export default {
  isInitialized: false,

  initializeWithMiddleware() {
    if (!config.IS_PRODUCTION) {
      return emptyMiddleWare;
    }
    Sentry.init({
      dist: config.RELEASE_ID,
      dsn: 'https://84d2036467d546038347f0ac9ccd8b3b:c815982d89764df583493a60794e54aa@sentry.cnx.org/17',
      environment: config.DEPLOYED_ENV,
    });
    this.isInitialized = true;
    return createSentryMiddleware(Sentry);
  },

  captureException(error: any) {
    if (this.isInitialized) {
      Sentry.captureException(error);
    }
  },

  captureMessage(message: string, level: Sentry.Severity) {
    if (this.isInitialized) {
      Sentry.captureMessage(message, level);
    }
  },

  log(message: string) {
    this.captureMessage(message, Sentry.Severity.Log);
  },

  warn(message: string) {
    this.captureMessage(message, Sentry.Severity.Warning);
  },

  error(message: string) {
    this.captureMessage(message, Sentry.Severity.Error);
  },

};
