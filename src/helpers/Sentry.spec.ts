import * as SentryLibrary from '@sentry/react';
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

jest.mock('@sentry/react', () => ({
  ...(jest as any).requireActual('@sentry/react'),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  configureScope: jest.fn(),
  createReduxEnhancer: jest.fn(),
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

    Sentry.initialize(store);
    expect(Sentry.isEnabled).toBe(true);

    expect(SentryLibrary.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dist: config.RELEASE_ID,
        dsn: expect.stringMatching('https://'),
        environment: config.DEPLOYED_ENV,
      })
    );
  });

  it('wraps and configs createReduxEnhancer', () => {
    Sentry.createReduxEnhancer();
    expect(SentryLibrary.createReduxEnhancer).toHaveBeenCalledWith({});
  });

  it('forwards log calls to sentry', () => {
    config.SENTRY_ENABLED = true;
    Sentry.initialize(store);
    const err = new Error('this is bad');
    Sentry.captureException(err);
    expect(SentryLibrary.captureException).toHaveBeenCalledWith(err, { level: 'error' });
    Sentry.captureException(err, 'warning');
    expect(SentryLibrary.captureException).toHaveBeenCalledWith(err, { level: 'warning' });
    Sentry.log('logged');
    expect(SentryLibrary.captureMessage).toHaveBeenCalledWith('logged', 'log');
  });

  it('skips logging when not enabled', () => {
    config.SENTRY_ENABLED = false;
    Sentry.initialize(store);
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
    Sentry.initialize(store);

    const spyConsoleError = jest.spyOn(console, 'error')
      .mockImplementationOnce(jest.fn)
    ;

    expect(spyConsoleError).not.toHaveBeenCalled();

    const err = new Error('asdf');
    Sentry.captureException(err);

    expect(spyConsoleError).toHaveBeenCalledWith(err);
  });

  it('logs to (info) console when not enabled', () => {
    config.SENTRY_ENABLED = false;
    Sentry.initialize(store);

    const spyConsoleInfo = jest.spyOn(console, 'info')
      .mockImplementation(jest.fn())
    ;

    expect(spyConsoleInfo).not.toHaveBeenCalled();

    Sentry.captureException(new Error('asdf'), 'info');
    expect(spyConsoleInfo).toHaveBeenCalledWith('asdf');

    Sentry.captureException('qwer', 'info');
    expect(spyConsoleInfo).toHaveBeenCalledWith('qwer');
  });

  it('logs to (warn) console when not enabled', () => {
    config.SENTRY_ENABLED = false;
    Sentry.initialize(store);

    const spyConsoleWarn = jest.spyOn(console, 'warn')
      .mockImplementation(jest.fn())
    ;

    expect(spyConsoleWarn).not.toHaveBeenCalled();

    Sentry.captureException(new Error('asdf'), 'warning');
    expect(spyConsoleWarn).toHaveBeenCalledWith('asdf');

    Sentry.captureException('qwer', 'warning');
    expect(spyConsoleWarn).toHaveBeenCalledWith('qwer');
  });

  it('noops on undefined', () => {
    config.SENTRY_ENABLED = false;
    Sentry.initialize(store);

    const spyConsoleError = jest.spyOn(console, 'error')
      .mockImplementationOnce(jest.fn)
    ;

    Sentry.captureException(undefined);

    expect(SentryLibrary.captureException).not.toHaveBeenCalled();
    expect(spyConsoleError).not.toHaveBeenCalled();
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
