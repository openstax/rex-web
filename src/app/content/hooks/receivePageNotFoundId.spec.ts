import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
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
  // let findRouteSpy: jest.SpyInstance;
  let fetchBackup: any;
  let window: Window;
  let assign: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();
    delete (window as any).location;

    window.location = {
      assign: jest.fn(),
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

    // findRouteSpy = jest.spyOn(helpers.router, 'findRoute')
    //   .mockImplementation(jest.fn());

    assign = jest.spyOn(window.location, 'assign');

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

  it('sets window.location if non-rex redirect is found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: 'redirected' }]);

    await hook(receivePageNotFoundId('asdf'));
    jest.spyOn(helpers.router, 'findRoute').mockReturnValue(undefined);

    expect(assign).toHaveBeenCalledWith('redirected');
  });

  it('calls history.replace if rex redirect is found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: '/books/redirected' }]);

    await hook(receivePageNotFoundId('asdf'));
    const match = {route: {getUrl: jest.fn(() => 'url')}} as unknown as AnyMatch;

    jest.spyOn(helpers.router, 'findRoute').mockReturnValue(match);

    expect(historyReplaceSpy).toHaveBeenCalledWith('/books/redirected');
  });
});
