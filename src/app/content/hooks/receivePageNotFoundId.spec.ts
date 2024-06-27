import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { createRouterService } from '../../navigation/routerService';
import { MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils';
import { receivePageNotFoundId } from '../actions';
import { processBrowserRedirect } from '../utils/processBrowserRedirect';
import * as errors from '../../errors';
import * as content from '../../content';
import { AnyMatch } from '../../navigation/types';
import { replace } from '../../navigation/actions';

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
  let dispatch: jest.SpyInstance;
  let fetchBackup: any;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();
    delete (window as any).location;

    window.location = {
      origin: 'openstax.org',
    } as any as Window['location'];

    helpers = {
      ...createTestServices(),
      router: createRouterService([...Object.values(content.routes), ...Object.values(errors.routes)]),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    helpers.history.location = {
      pathname: '/books/physics/pages/1-introduction301',
    } as any;

    dispatch = jest.spyOn(helpers, 'dispatch');

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

  it('calls history.replace if redirect is found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: 'https://openstax.org/books/redirected' }]);

    await processBrowserRedirect(helpers);

    expect(dispatch).toHaveBeenCalledWith(replace(helpers.router.findRoute('https://openstax.org/books/redirected') as AnyMatch));
  });
});
