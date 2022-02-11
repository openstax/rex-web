import Sentry from '../../../helpers/Sentry';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { receiveFeatureFlags } from '../../featureFlags/actions';
import { MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { formatBookData } from '../utils';
import kineticEnabled from './kineticEnabled';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

const combinedBook = formatBookData(book, mockCmsBook);

describe('kineticEnabled hook', () => {
  let hook: ReturnType<typeof import ('./kineticEnabled').default>;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let captureException: jest.SpyInstance;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;
  const fetchBackup = fetch;

  afterEach(() => {
    (global as any).fetch = fetchBackup;
    captureException.mockRestore();
  });

  beforeEach(() => {
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');
    captureException = jest.spyOn(Sentry, 'captureException');

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = kineticEnabled(helpers);
  });

  it('does nothing if book is not loaded', async() => {
    store.dispatch(receivePage({...page, references: []}));

    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does nothing when no osweb data is loaded', async() => {
    store.dispatch(receiveBook(book));

    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does nothing when ineligible', async() => {
    (global as any).fetch = mockFetch(200, {
      eligible: false,
    });
    store.dispatch(receiveBook(combinedBook));

    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches when eligible', async() => {
    (global as any).fetch = mockFetch(200, {
      eligible: true,
    });
    store.dispatch(receiveBook(combinedBook));

    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(dispatch).toHaveBeenCalledWith(receiveFeatureFlags(['kineticEnabled']));
  });

  it('dispatches when eligible', async() => {
    (global as any).fetch = mockFetch(200, {
      eligible: true,
    });
    store.dispatch(receiveBook(combinedBook));

    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(dispatch).toHaveBeenCalledWith(receiveFeatureFlags(['kineticEnabled']));
  });

  it('noops when error', async() => {
    const err = {asdfasdf: 'asdfasdf'};
    captureException.mockReturnValue(null);
    (global as any).fetch = () => Promise.reject(err);
    store.dispatch(receiveBook(combinedBook));

    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(captureException).toHaveBeenCalledWith(err);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
