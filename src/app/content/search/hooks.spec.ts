import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { AppServices, MiddlewareAPI, Store } from '../../types';
import { receiveBook } from '../actions';
import { formatBookData } from '../utils';
import { receiveSearchResults, requestSearch } from './actions';
import { requestSearchHook } from './hooks';

describe('requestSearchHook', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let hook: ReturnType<typeof requestSearchHook>;

  beforeEach(() => {
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    hook = requestSearchHook(helpers);
    dispatch = jest.spyOn(helpers, 'dispatch');
  });

  it('searches', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    await hook(requestSearch('asdf'));
    expect(helpers.searchClient.search).toHaveBeenCalled();
  });

  it('noops when there isn\'t a book', async() => {
    await hook(requestSearch('asdf'));
    expect(helpers.searchClient.search).not.toHaveBeenCalled();
  });

  it('noops when query is empty', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    await hook(requestSearch(''));
    expect(helpers.searchClient.search).not.toHaveBeenCalled();
  });

  it('dispatches receiveSearchResults', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    (helpers.searchClient.search as any).mockReturnValue('searchresults');
    await hook(requestSearch('asdf'));
    expect(dispatch).toHaveBeenCalledWith(receiveSearchResults('searchresults' as any));
  });
});
