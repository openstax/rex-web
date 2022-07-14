import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePageNotFoundId } from '../actions';
import { formatBookData } from '../utils';

const book = formatBookData(archiveBook, mockCmsBook);

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

  beforeEach(() => {
    store = createTestStore();

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

  it('calls history.replace if redirect is found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: helpers.history.location.pathname, to: 'redirected' }]);

    await hook(receivePageNotFoundId('asdf'));

    expect(historyReplaceSpy).toHaveBeenCalledWith('redirected');
  });

  it('throws if redirect is not found and book is retired', async() => {
    store.dispatch(receiveBook(book));
    const spy = jest.spyOn(helpers.bookConfigLoader, 'getBookVersionFromUUID');
    spy.mockReturnValue(Promise.resolve({defaultVersion: book.version, retired: true}));

    (globalThis as any).fetch = mockFetch([{ from: 'asd', to: 'asd' }]);

    await expect(
      hook(receivePageNotFoundId('asdf'))
    ).rejects.toThrow(`Could not resolve uuid: ${book.id}`);
  });
});
