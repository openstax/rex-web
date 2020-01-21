import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook } from '../../actions';
import { formatBookData } from '../../utils';
import { receiveHighlightsTotalCounts, setSummaryFilters } from '../actions';
import { CountsPerSource } from '../types';

describe('receiveHighlightsTotalCounts', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./receiveHighlightsTotalCounts').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./receiveHighlightsTotalCounts').hookBody)(helpers);
  });

  it('noops if there is no location filters with content', async() => {
    const totalCountsPerPage = null as unknown as CountsPerSource;

    await hook(store.dispatch(receiveHighlightsTotalCounts(totalCountsPerPage)));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('set locations with highlights to summary filters', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const totalCountsPerPage = {
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 2},
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': {[HighlightColorEnum.Green]: 1},
      'testbook1-testpage4-uuid': {[HighlightColorEnum.Green]: 5},
    };

    const expectedLocationFiltersIds = [
      'testbook1-testpage1-uuid',
      'testbook1-testchapter1-uuid',
      'testbook1-testchapter3-uuid',
    ];

    await hook(store.dispatch(receiveHighlightsTotalCounts(totalCountsPerPage)));

    expect(dispatch).toHaveBeenLastCalledWith(setSummaryFilters({ locationIds: expectedLocationFiltersIds }));
  });
});
