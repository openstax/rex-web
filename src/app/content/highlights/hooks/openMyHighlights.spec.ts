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
import { openMyHighlights, setSummaryFilters } from '../actions';
import { highlightLocationFilters } from '../selectors';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';

describe('openMyHighlights', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./openMyHighlights').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./openMyHighlights').hookBody)(helpers);
  });

  it('call setSummaryFilter on openMyHighlights', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location).toBeDefined();

    const mock = mockHighlight();
    const highlights = [{id: mock.id, sourceId: page.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights}));

    hook(openMyHighlights());

    expect(dispatch).toHaveBeenCalledWith(setSummaryFilters({
      locationIds: [location!.id],
    }));
  });

  it('do not call setSummaryFilter on openMyHighlights if location filter is already present', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location).toBeDefined();

    const newFitlers = {
      locationIds: [location!.id],
    };

    helpers.dispatch(setSummaryFilters(newFitlers));

    expect(dispatch).toHaveBeenCalledWith(setSummaryFilters(newFitlers));
    expect(store.getState().content.highlights.summary.filters.locationIds[0]).toEqual(location!.id);

    const mock = mockHighlight();
    const highlights = [{id: mock.id, sourceId: page.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights}));

    hook(openMyHighlights());

    expect(dispatch).toBeCalledTimes(1);
  });

  it('does not call setSummary if user is not authenticated', () => {
    hook(openMyHighlights());

    expect(dispatch).not.toHaveBeenCalled();
  });
});
