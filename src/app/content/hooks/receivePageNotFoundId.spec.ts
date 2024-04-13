import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { notFound } from '../../errors/routes';
import { AnyMatch } from '../../navigation/types';
import { MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils';
import { receivePageNotFoundId } from '../actions';

const mockFetch = (valueToReturn: any, error?: any) => () => new Promise((resolve, reject) => {
  if (error) {
    reject(error);
  }
  resolve({ json: () => new Promise((res) => res(valueToReturn)) });
});

describe('receivePageNotFoundId hook', () => {
  let hook: ReturnType<typeof import ('./receivePageNotFoundId').receivePageNotFoundIdHookBody>;
  let store: Store;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;
  let historyReplaceSpy: jest.SpyInstance;
  let fetchBackup: any;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();
    delete (window as any).location;

    window.location = {
      pathname: '',
    } as any as Window['location'];

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    helpers.history.location = {
      pathname: '/books/physics/pages/1-introduction301',
    } as any;

    historyReplaceSpy = jest.spyOn(helpers.history, 'replace')
      .mockImplementation(jest.fn());

    fetchBackup = (globalThis as any).fetch;

    hook = require('./receivePageNotFoundId').receivePageNotFoundIdHookBody(helpers);
  });

  afterEach(() => {
    (globalThis as any).fetch = fetchBackup;
  });

  it('checks for redirects when receivePageNotFoundId is dispatched and noops if path wasn\'t found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: 'asd', to: 'asd' }]);

    await hook(receivePageNotFoundId('asdf'));

    expect(historyReplaceSpy).not.toHaveBeenCalled();
  });

  it('noops if fetch fails', async() => {
    (globalThis as any).fetch = mockFetch(undefined, 'error');

    await hook(receivePageNotFoundId('asdf'));

    expect(historyReplaceSpy).not.toHaveBeenCalled();
  });

  it('calls history.replace if redirect is found and target is within rex', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: '/books/redirected' }]);

    const match = {route: {getUrl: jest.fn(() => 'url')}, state: true} as unknown as AnyMatch;
    jest.spyOn(helpers.router, 'findRoute').mockReturnValue(match);

    await hook(receivePageNotFoundId('asdf'));

    expect(historyReplaceSpy).toHaveBeenCalledWith('/books/redirected');
  });

  it('does not call history.replace if target is not within rex', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: '/redirected' }]);
    
    const match = {route: notFound, state: false} as unknown as AnyMatch;
    jest.spyOn(helpers.router, 'findRoute').mockReturnValue(match);

    await hook(receivePageNotFoundId('asdf'));

    expect(historyReplaceSpy).not.toHaveBeenCalled();
  });
});
