import { createTestServices } from '../../test/createTestServices';
import { createTestStore } from '../../test/createTestStore';
import { AppServices, Store } from '../types';
import { receiveLoggedOut } from './actions';
import { waitForAuthInitialization } from './utils';

describe('waitForAuthInitialization', () => {
  let store: Store;
  let services: AppServices;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  it('resolves immediately', async() => {
    store.dispatch(receiveLoggedOut());
    const result = await waitForAuthInitialization({store, services}, 1000);
    expect(result).toBe(true);
  });

  it('resolves after waiting', async() => {
    const result = waitForAuthInitialization({store, services});
    store.dispatch(receiveLoggedOut());
    expect(await result).toBe(true);
  });
});
