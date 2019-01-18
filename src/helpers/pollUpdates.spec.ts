import { createStore } from 'redux';
import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import pollUpdatesType from './pollUpdates';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('poll updates', () => {
  let cancel: ReturnType<typeof pollUpdatesType>;
  const fetchBackup = fetch;
  let store: Store;

  beforeEach(() => {
    jest.useFakeTimers();
    store = createStore((_) => ({}));
    store.dispatch = jest.fn(store.dispatch);
    (global as any).fetch = mockFetch(200, {id: 'releaseid'});
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

    it('fetches /rex/release.json', () => {
      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();
      expect(fetch).toHaveBeenCalledWith('/rex/release.json');
    });

    it('fetches /rex/release.json at an interval', () => {
      cancel = pollUpdates(store);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenNthCalledWith(1, '/rex/release.json');
      expect(fetch).toHaveBeenNthCalledWith(2, '/rex/release.json');
      expect(fetch).toHaveBeenNthCalledWith(3, '/rex/release.json');
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
      expect(fetch).toHaveBeenNthCalledWith(1, '/rex/release.json');

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
