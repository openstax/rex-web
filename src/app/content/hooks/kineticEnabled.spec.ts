import { resetK12PortalCache } from '../../../helpers/analytics/k12Portal';
import Sentry from '../../../helpers/Sentry';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { receiveFeatureFlags } from '../../featureFlags/actions';
import { locationChange } from '../../navigation/actions';
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
    resetK12PortalCache();
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

  describe('outside the browser', () => {
    const documentBack = document;

    beforeEach(() => {
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).document = documentBack;
    });

    it('does nothing', async() => {
      await hook(receivePage({ ...page, references: [] }));

      expect(dispatch).not.toHaveBeenCalled();
    });
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

  describe('on a portal route', () => {
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {eligible: true});
      store.dispatch(locationChange({
        action: 'PUSH',
        location: {} as any,
        match: {params: {portalName: 'some-school'}} as any,
      }));
      store.dispatch(receiveBook(combinedBook));
      dispatch.mockClear();
    });

    it('does nothing for a K12 school', async() => {
      helpers.osWebLoader.getSchoolDataFromPortalName.mockReturnValue(Promise.resolve({industry: 'K12'} as any));
      await hook(receivePage({...page, references: []}));

      expect(fetch).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('dispatches when the portal has no school data', async() => {
      helpers.osWebLoader.getSchoolDataFromPortalName.mockReturnValue(Promise.resolve(undefined as any));
      await hook(receivePage({...page, references: []}));

      expect(dispatch).toHaveBeenCalledWith(receiveFeatureFlags(['kineticEnabled']));
    });

    it('dispatches when the school lookup fails', async() => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      helpers.osWebLoader.getSchoolDataFromPortalName.mockReturnValue(Promise.reject(new Error('boom')));
      await hook(receivePage({...page, references: []}));

      expect(dispatch).toHaveBeenCalledWith(receiveFeatureFlags(['kineticEnabled']));
      error.mockRestore();
    });

    it('dispatches for a non-K12 school', async() => {
      helpers.osWebLoader.getSchoolDataFromPortalName.mockReturnValue(Promise.resolve({industry: 'HE'} as any));
      await hook(receivePage({...page, references: []}));

      expect(dispatch).toHaveBeenCalledWith(receiveFeatureFlags(['kineticEnabled']));
    });
  });

  it('does not look up school data on a normal page', async() => {
    (global as any).fetch = mockFetch(200, {eligible: true});
    store.dispatch(receiveBook(combinedBook));
    dispatch.mockClear();
    await hook(receivePage({...page, references: []}));

    expect(helpers.osWebLoader.getSchoolDataFromPortalName).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receiveFeatureFlags(['kineticEnabled']));
  });
});
