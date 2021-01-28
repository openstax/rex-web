import * as SentryLibrary from '@sentry/browser';
import { recordSentryMessage } from '../app/errors/actions';
import { Store } from '../app/types';
import config from '../config';
import createTestStore from '../test/createTestStore';
import Sentry, { onBeforeSend } from './Sentry';

jest.unmock('./Sentry');
jest.mock('../config', () => ({
  DEPLOYED_ENV: 'test',
  RELEASE_ID: '1234',
  SENTRY_ENABLED: false,
}));

jest.mock('@sentry/browser', () => ({
  ...(jest as any).requireActual('@sentry/browser'),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  configureScope: jest.fn(),
  init: jest.fn(),
}));

describe('Sentry error logging', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let beforeSend: ReturnType<typeof onBeforeSend>;
  beforeEach(() => {
    jest.clearAllMocks();

    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');

    beforeSend = onBeforeSend(store);
  });

  it('initializes Sentry library', () => {
    expect(SentryLibrary.init).not.toHaveBeenCalled();
    config.SENTRY_ENABLED = true;

    // ensure methods can be called before initialize without errors
    Sentry.captureException(new Error('test'));
    expect(SentryLibrary.captureException).not.toHaveBeenCalled();

    const middleware = Sentry.initializeWithMiddleware()(store);
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
    config.SENTRY_ENABLED = true;
    Sentry.initializeWithMiddleware()(store);
    const err = new Error('this is bad');
    Sentry.captureException(err);
    expect(SentryLibrary.captureException).toHaveBeenCalledWith(err);
    Sentry.log('logged');
    expect(SentryLibrary.captureMessage).toHaveBeenCalledWith('logged', 'log');
  });

  it('skips logging when not enabled', () => {
    config.SENTRY_ENABLED = false;
    Sentry.initializeWithMiddleware()(store);
    expect(Sentry.isEnabled).toBe(false);
    expect(SentryLibrary.captureException).not.toHaveBeenCalled();

    config.SENTRY_ENABLED = true;
    expect(Sentry.isEnabled).toBe(true);
    Sentry.log('test log');
    Sentry.warn('test warn');
    Sentry.error('test error');
    expect(SentryLibrary.captureMessage).toHaveBeenCalledTimes(3);
  });

  it('logs to console when not enabled', () => {
    config.SENTRY_ENABLED = false;
    Sentry.initializeWithMiddleware();

    const spyConsoleError = jest.spyOn(console, 'error')
      .mockImplementationOnce(jest.fn)
    ;

    expect(spyConsoleError).not.toHaveBeenCalled();

    Sentry.captureException(new Error('asdf'));

    expect(spyConsoleError).toHaveBeenCalled();
  });

  it('uses isEnabled in capture message', () => {
    const mock = jest.spyOn(Sentry, 'isEnabled', 'get');
    mock.mockImplementation(() => false);
    Sentry.log('test log');
    expect(SentryLibrary.captureMessage).not.toHaveBeenCalled();
    mock.mockImplementation(() => true);
    expect(Sentry.isEnabled).toBe(true);
    Sentry.log('test log');
    expect(SentryLibrary.captureMessage).toHaveBeenCalled();
    mock.mockRestore();
  });

  describe('onBeforeSend', () => {
    it('does nothing if event does not have an id', () => {
      const event = {};

      const processedEvent = beforeSend(event);

      expect(dispatch).not.toHaveBeenCalled();
      expect(processedEvent).toEqual(event);
    });

    it('adds event\'s id to state', () => {
      const event = {event_id: 'random id', exception: {}};

      const processedEvent = beforeSend(event);
      expect(dispatch).toHaveBeenCalledWith(recordSentryMessage(event.event_id));
      expect(processedEvent).toEqual(event);
    });
  });
});
