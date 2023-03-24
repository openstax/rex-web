import { createTestServices } from '../../test/createTestServices';
import { createTestStore } from '../../test/createTestStore';
import { AppServices, Store } from '../types';
import { setHead } from './actions';
import { waitForHeadInitializaton } from './utils';

describe('waitForHeadInitializaton', () => {
  let store: Store;
  let services: AppServices;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  it('resolves immediately', async() => {
    store.dispatch(setHead({title: 'aasdf', meta: [], links: []}));
    const result = await waitForHeadInitializaton({store, services}, 1000);
    expect(result).toBe(true);
  });

  it('resolves after waiting', async() => {
    const result = waitForHeadInitializaton({store, services});
    store.dispatch(setHead({title: 'aasdf', meta: [], links: []}));
    expect(await result).toBe(true);
  });
});
