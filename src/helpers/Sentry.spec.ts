import * as SentryLibrary from '@sentry/browser';
import config from '../config';
import Sentry from './Sentry';

jest.mock('../config', () => ({
  DEPLOYED_ENV: 'test',
  IS_PRODUCTION: false,
  RELEASE_ID: '1234',
}));

jest.mock('@sentry/browser', () => ({
  Severity: {
    Log: 'log',
  },
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  init: jest.fn(),
}));

describe('Sentry error logging', () => {

  beforeEach(() => {
    Sentry.isInitialized = false;
    jest.clearAllMocks();
  });

  it('initializes Sentry library', () => {
    expect(SentryLibrary.init).not.toHaveBeenCalled();

    // ensure methods can be called before initialize without errors
    Sentry.captureException(new Error('test'));
    expect(SentryLibrary.captureException).not.toHaveBeenCalled();

    config.IS_PRODUCTION = true;
    const middleware = Sentry.initializeWithMiddleware();
    expect(middleware).toBeDefined();

    expect(SentryLibrary.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dist: config.RELEASE_ID,
        dsn: expect.stringMatching('https://'),
        environment: config.DEPLOYED_ENV,
      })
    );
  });

  it('forwards log calls to sentry', () => {
    config.IS_PRODUCTION = true;
    Sentry.initializeWithMiddleware();
    const err = new Error('this is bad');
    Sentry.captureException(err);
    expect(SentryLibrary.captureException).toHaveBeenCalledWith(err);
    Sentry.log('logged');
    expect(SentryLibrary.captureMessage).toHaveBeenCalledWith('logged', 'log');
  });

  it('skips logging when not production', () => {
    config.IS_PRODUCTION = false;
    Sentry.initializeWithMiddleware();
    //    expect(SentryLibrary.captureException).not.toHaveBeenCalled();

    Sentry.captureException(new Error('this is bad'));
    expect(SentryLibrary.captureException).not.toHaveBeenCalled();
    Sentry.log('test');
    expect(SentryLibrary.captureMessage).not.toHaveBeenCalled();
  });

});
