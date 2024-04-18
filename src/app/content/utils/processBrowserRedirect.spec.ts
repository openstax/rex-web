import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { replace } from '../../navigation/actions';
import { createRouterService } from '../../navigation/routerService';
import { AnyMatch } from '../../navigation/types';
import { MiddlewareAPI, Store } from '../../types';
import { processBrowserRedirect } from './processBrowserRedirect';
import * as content from '../../content';
import * as errors from '../../errors';

const mockFetch = (valueToReturn: any, error?: any) => () => new Promise((resolve, reject) => {
  if (error) {
    reject(error);
  }
  resolve({ json: () => new Promise((res) => res(valueToReturn)) });
});

describe('processBrowserRedirect', () => {
  let helpers: Pick<MiddlewareAPI, 'dispatch'> & ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;
  let fetchBackup: any;
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      router: createRouterService(Object.values({...content.routes, ...errors.routes})),
    };

    helpers.history.location = {
      pathname: '/books/physics/pages/1-introduction301',
    } as any;

    dispatch = jest.spyOn(helpers, 'dispatch');

    fetchBackup = (globalThis as any).fetch;
  });

  afterEach(() => {
    (globalThis as any).fetch = fetchBackup;
  });

  it('calls history.replace if redirect is found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: '/books/redirected' }]);

    await processBrowserRedirect(helpers);

    expect(dispatch).toHaveBeenCalledWith(replace(helpers.router.findRoute('/books/redirected') as AnyMatch));
  });

});