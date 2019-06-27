import { createStore } from 'redux';
import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import pollUpdatesType, { Cancel, poll as pollType } from './pollUpdates';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('poll updates', () => {
  let cancel: Cancel;
  const fetchBackup = fetch;
  let store: Store;

  beforeEach(() => {
    jest.useFakeTimers();
    store = createStore((_) => ({}));
    store.dispatch = jest.fn(store.dispatch);
    (global as any).fetch = mockFetch(200, {release_id: 'releaseid'});
  });

  afterEach(() => {
    if (cancel) {
      cancel();
    } else {
      throw new Error('test did not set its cancel function, probably leaking timers');
    }
    jest.resetModules();
    (global as any).fetch = fetchBackup;
  });

  describe('in production', () => {
    let pollUpdates: typeof pollUpdatesType;

    beforeEach(() => {
      jest.resetModules();
      jest.mock('../config', () => ({
        APP_ENV: 'production',
        RELEASE_ID: 'releaseid',
      }));
      pollUpdates = require('./pollUpdates').default;
    });

    it('fetches /rex/environment.json', () => {
      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();
      expect(fetch).toHaveBeenCalledWith('/rex/environment.json');
    });

    it('fetches /rex/environment.json at an interval', () => {
      cancel = pollUpdates(store);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenNthCalledWith(1, '/rex/environment.json');
      expect(fetch).toHaveBeenNthCalledWith(2, '/rex/environment.json');
      expect(fetch).toHaveBeenNthCalledWith(3, '/rex/environment.json');
    });

    it('dispatches updateAvailable', async() => {
      (global as any).fetch = mockFetch(200, {id: 'releaseid2'});

      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch

      expect(store.dispatch).toHaveBeenCalledWith(updateAvailable());
    });

    it('clears interval after success', async() => {
      cancel = pollUpdates(store);

      jest.runOnlyPendingTimers();
      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenNthCalledWith(1, '/rex/environment.json');

      (global as any).fetch = mockFetch(200, {id: 'releaseid2'});
      jest.runOnlyPendingTimers();
      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch
      expect(fetch).toHaveBeenCalledTimes(1); // fetch has been replaced, so this is still 1

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('does nothing while focus is away', async() => {
      const event = document!.createEvent('Event');
      event.initEvent('visibilitychange', true, true);

      cancel = pollUpdates(store);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      expect(fetch).toHaveBeenCalledTimes(2);

      Object.defineProperty(document!, 'visibilityState', {value: 'hidden', writable: true});
      document!.dispatchEvent(event);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      Object.defineProperty(document!, 'visibilityState', {value: 'visible'});
      document!.dispatchEvent(event);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('outside production', () => {
    const pollUpdates = require('./pollUpdates').default;

    it('does nothing', () => {
      cancel = pollUpdates(store);
      jest.runAllTimers();
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});

describe('poll', () => {
  let cancel: Cancel;
  const fetchBackup = fetch;
  let poll: typeof pollType;
  let store: Store;

  beforeEach(() => {
    store = createStore((_) => ({}));
    store.dispatch = jest.fn(store.dispatch);
    (global as any).fetch = mockFetch(200, {release_id: 'releaseid'});
    cancel = jest.fn();
    jest.mock('../config', () => ({
      RELEASE_ID: 'releaseid',
    }));
    poll = require('./pollUpdates').poll;
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('calls cancel if the release is different', async() => {
    (global as any).fetch = mockFetch(200, {release_id: 'releaseid2'});
    await poll(store, cancel)();
    expect(cancel).toHaveBeenCalled();
  });

  it('doesn\'t call cancel if release is the same', async() => {
    await poll(store, cancel)();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('does nothing if error is returned', async() => {
    (global as any).fetch = jest.fn(() => Promise.reject());
    let message: undefined | string;

    try {
      await poll(store, cancel)();
    } catch (e) {
      message = e.message;
    }

    expect(cancel).not.toHaveBeenCalled();
    expect(message).toBeUndefined();
  });
});
