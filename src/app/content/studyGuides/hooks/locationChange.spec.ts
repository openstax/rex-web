import { Highlight } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { receiveFeatureFlags } from '../../../actions';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { maxHighlightsApiPageSize, studyGuidesFeatureFlag } from '../../constants';
import { CountsPerSource } from '../../types';
import { formatBookData } from '../../utils';
import { receiveStudyGuides, receiveStudyGuidesTotalCounts } from '../actions';

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  formatReceivedHighlights: () => ['mocked'],
}));

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;
  let mockSummaryResponse: { countsPerSource: CountsPerSource };

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    mockSummaryResponse = {
      countsPerSource: {
        source: {
          green: 1,
        },
      },
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./locationChange').default)(helpers);
  });

  it('fetch study guides on locationChange', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const mockHighlightsResponse = {
      data: [{ id: 'asd', sourceId: 'asd' }] as unknown as Highlight[],
      meta: {
        page: 1,
        perPage: maxHighlightsApiPageSize,
        totalCount: 1,
      },
    };

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));
    const getStudyGuidesHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(new Promise((res) => res(mockHighlightsResponse)));

    await hook();

    expect(getHighlightsSummary).toHaveBeenCalled();
    expect(getStudyGuidesHighlights).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource)
    );
    expect(dispatch).toHaveBeenCalledWith(receiveStudyGuides(mockHighlightsResponse.data));
  });

  it('noops on locationChange if feature flag is not present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource));
  });

  it('noops on locationChange if book is not loaded', async() => {
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource));
  });

  it('noops on locationChange if summary is already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));
    store.dispatch(receiveStudyGuidesTotalCounts({ asd: { green: 1 }}));

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource));
  });
});
