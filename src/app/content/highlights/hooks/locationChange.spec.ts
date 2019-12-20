import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import mockHighlight from '../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { resetModules } from '../../../../test/utils';
import { receiveUser } from '../../../auth/actions';
import { formatUser } from '../../../auth/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { receiveHighlights, setSummaryFilters } from '../actions';
import { highlightStyles } from '../constants';
import { highlightLocations } from '../selectors';
import { HighlightData } from '../types';
import { getHighlightLocationForPage } from '../utils';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./locationChange').default)(helpers);
  });

  it('noops with no book', () => {
    store.dispatch(receivePage({...page, references: []}));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('receives highlights', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights(highlights));
  });

  it('do not call receiveHighlights on invalid response', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    await hook();

    expect(dispatch).not.toHaveBeenCalledWith(receiveHighlights([]));
  });

  it('call only setSummaryFilters on invalid response', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    const locations = highlightLocations(store.getState());
    const location = getHighlightLocationForPage(locations, page);

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(setSummaryFilters({
      colors: highlightStyles.map(({label}) => label),
      locationIds: [location!.id],
    }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('call setSummaryFilter and receiveHighlights on valid response', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    const locations = highlightLocations(store.getState());
    const location = getHighlightLocationForPage(locations, page);

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights(highlights));
    expect(dispatch).toHaveBeenLastCalledWith(setSummaryFilters({
      colors: highlightStyles.map(({label}) => label),
      locationIds: [location!.id],
    }));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});
