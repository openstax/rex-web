import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { receiveFeatureFlags } from '../../../actions';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { practiceQuestionsFeatureFlag } from '../../constants';
import { formatBookData } from '../../utils';
import { receivePracticeQuestionsSummary } from '../actions';
import { PracticeQuestionsSummary } from '../types';

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;
  let mockSummaryResponse: PracticeQuestionsSummary;

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
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('noops on locationChange if feature flag is not present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
    .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('noops on locationChange if book is not loaded', async() => {
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('noops on locationChange if summary is already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { asd: 1 } }));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockReturnValue(new Promise((res) => res(mockSummaryResponse)));

    await hook();

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  describe.only('error handling', () => {
    it('call sentry on fetch failure', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({...shortPage, references: []}));
      store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

      const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => null);

      const mockError = new Error('asdf');

      const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
        .mockReturnValue(new Promise((_res, rej) => rej(mockError)));

      await hook();

      expect(getSummary).toHaveBeenCalled();
      expect(captureException).toHaveBeenCalledWith(mockError);
    });
  });
});
