import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { studyGuidesFeatureFlag } from '../../constants';
import { CountsPerSource } from '../../highlights/types';
import { formatBookData } from '../../utils';
import { receiveStudyGuidesTotalCounts } from '../actions';

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;
  let mockSummaryResponse: { countsPerSource: CountsPerSource };

  beforeEach(() => {
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

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));
    const getStudyGuidesHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    await hook();

    expect(getHighlightsSummary).toHaveBeenCalled();
    expect(getStudyGuidesHighlights).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource)
    );
  });

  it('noops on locationChange if feature flag is not present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(
      receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource)
    );
  });

  it('noops on locationChange if book is not loaded', async() => {
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(
      receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource)
    );
  });

  it('noops on locationChange if summary is already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));
    store.dispatch(receiveStudyGuidesTotalCounts({ asd: { green: 1 }}));

    const getHighlightsSummary = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getHighlightsSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(
      receiveStudyGuidesTotalCounts(mockSummaryResponse.countsPerSource)
    );
  });

  it('throws HighlightLoadError', async() => {
    expect.assertions(3);
    const error = {} as any;

    jest.spyOn(Date, 'now')
      .mockReturnValue(1);

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({ ...shortPage, references: [] }));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const getHighlightsSummaryClient = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
      .mockRejectedValueOnce(error);

    try {
      await hook();
    } catch (error) {
      expect(getHighlightsSummaryClient).toHaveBeenCalled();
      expect(error.messageKey).toBe(toastMessageKeys.studyGuides.failure.load);
      expect(error.meta).toEqual({ destination: 'page' , shouldAutoDismiss: false});
    }
  });

  it('throws ApplicationError', async() => {
    expect.assertions(3);
    const mockCustomApplicationError = new ApplicationError('error');

    jest.spyOn(Date, 'now')
      .mockReturnValue(1);

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({ ...shortPage, references: [] }));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const getHighlightsSummaryClient = jest.spyOn(helpers.highlightClient, 'getHighlightsSummary')
    .mockRejectedValueOnce(mockCustomApplicationError);

    try {
      await hook();
    } catch (error) {
      expect(getHighlightsSummaryClient).toHaveBeenCalled();
      expect(error instanceof ApplicationError).toEqual(true);
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });
});
