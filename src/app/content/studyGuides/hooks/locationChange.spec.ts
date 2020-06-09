import { Highlight, HighlightsSummary } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { receiveFeatureFlags } from '../../../actions';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook } from '../../actions';
import { studyGuidesFeatureFlag } from '../../constants';
import { formatBookData } from '../../utils';
import { receiveStudyGuides, receiveStudyGuidesHighlights } from '../actions';

jest.mock('../../highlights/hooks/utils', () => ({
  ...jest.requireActual('../../highlights/hooks/utils'),
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

  it('fetch study guides on locationChange', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const mockResponse = { asd: 'asd' } as any as HighlightsSummary;

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockResponse)));
    const getStudyGuidesHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(new Promise((res) => res({ data: [{ id: 'asd', sourceId: 'asd' }] as any as Highlight[] })));

    await hook();

    expect(getHighlightsSummary).toHaveBeenCalled();
    expect(getStudyGuidesHighlights).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receiveStudyGuides(mockResponse));
    expect(dispatch).toHaveBeenCalledWith(receiveStudyGuidesHighlights(['mocked'] as any));
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
    store.dispatch(receiveStudyGuides({ countsPerSource: { asd: { green: 1 } } }));

    const mockResponse = { asd: 'asd' } as any as HighlightsSummary;

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receiveStudyGuides(mockResponse));
  });
});
