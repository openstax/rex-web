import { Highlight, HighlightsSummary } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { receiveFeatureFlags } from '../../../actions';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { studyGuidesFeatureFlag, maxHighlightsApiPageSize } from '../../constants';
import { CountsPerSource } from '../../types';
import { formatBookData } from '../../utils';
import { extractTotalCounts } from '../../utils/highlightSharedUtils';
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

  it.only('fetch study guides on locationChange', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const mockSummaryResponse = {
      countsPerSource: {
        source: {
          green: 1,
        },
      } as CountsPerSource,
    };

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
      receiveStudyGuidesTotalCounts(extractTotalCounts(mockSummaryResponse.countsPerSource))
    );
    expect(dispatch).toHaveBeenCalledWith(receiveStudyGuides(mockHighlightsResponse.data));
  });

  it('noops on locationChange if feature flag is not present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const mockResponse = { asd: 'asd' } as any as HighlightsSummary;

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuides(mockResponse));
  });

  it('noops on locationChange if book is not loaded', async() => {
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const mockResponse = { asd: 'asd' } as any as HighlightsSummary;

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuides(mockResponse));
  });

  it('noops on locationChange if summary is already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));
    store.dispatch(receiveStudyGuidesTotalCounts({ asd: { green: 1 }}));

    const mockResponse = { asd: 'asd' } as any as HighlightsSummary;

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuides(mockResponse));
  });
});
