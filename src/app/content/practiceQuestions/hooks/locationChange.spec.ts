import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { receiveFeatureFlags } from '../../../actions';
import * as navigationSelectors from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { practiceQuestionsFeatureFlag } from '../../constants';
import { formatBookData } from '../../utils';
import { receivePracticeQuestionsSummary } from '../actions';
import { modalUrlName } from '../constants';
import { PracticeQuestionsSummary } from '../types';

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;
  let mockSummaryResponse: PracticeQuestionsSummary;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    mockSummaryResponse = {
      countsPerSource: {
        pageId: 2,
      },
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./locationChange').default)(helpers);
  });

  it('fetch practice questions on locationChange', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);

    await hook();

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('opens modal if modal query is present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);

    const getQuery = jest.spyOn(navigationSelectors, 'query').mockReturnValue({modal: modalUrlName});

    await hook();

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(getQuery).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(openPracticeQuestions());
  });

  it('noops on locationChange if feature flag is not present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);

    await hook();

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('noops on locationChange if book is not loaded', async() => {
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);

    await hook();

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('noops on locationChange if summary is already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { asd: 1 } }));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);

    await hook();

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  describe('error handling', () => {
    it('call sentry on fetch failure', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({...shortPage, references: []}));
      store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

      const mockError = new Error('asdf');

      const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
        .mockRejectedValue(mockError);

      await hook();

      expect(getSummary).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    });
  });
});
