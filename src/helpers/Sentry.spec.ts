import * as SentryLibrary from '@sentry/browser';
import config from '../config';
import Sentry from './Sentry';

jest.mock('@sentry/browser', () => ({
  Severity: {
    Log: 'log',
  },
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  init: jest.fn(),
}));

describe('Sentry error logging', () => {
  it('initializes Sentry library', () => {
    expect(SentryLibrary.init).not.toHaveBeenCalled();
    const middleware = Sentry.initializeWithMiddleware();
    expect(middleware).toBeDefined();
    expect(SentryLibrary.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dist: config.CODE_VERSION,
        dsn: expect.stringMatching('https://'),
        environment: config.DEPLOYED_ENV,
      })
    );
  });

  it('forwards log calls to sentry', () => {
    const err = new Error('this is bad');
    Sentry.captureException(err);
    expect(SentryLibrary.captureException).toHaveBeenCalledWith(err);
    Sentry.log('logged');
    expect(SentryLibrary.captureMessage).toHaveBeenCalledWith('logged', 'log');
  });
});
