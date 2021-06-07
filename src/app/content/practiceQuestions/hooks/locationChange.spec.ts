import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { receiveFeatureFlags } from '../../../actions';
import * as navigationSelectors from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { modalQueryParameterName, practiceQuestionsFeatureFlag } from '../../constants';
import { LinkedArchiveTreeSection } from '../../types';
import { formatBookData } from '../../utils';
import * as archiveTreeUtils from '../../utils/archiveTreeUtils';
import { receivePracticeQuestionsSummary, setSelectedSection } from '../actions';
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

  it('fetches practice questions and sets selected section on locationChange', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });

    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(section));
  });

  it('noops on locationChange if feature flag is not present', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });
    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(dispatch).not.toHaveBeenCalledWith(setSelectedSection(section));
  });

  it('noops on locationChange if book and page is not loaded', async() => {
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });

    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(dispatch).not.toHaveBeenCalledWith(setSelectedSection(section));
  });

  it('only sets selected sections if summary is already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { asd: 1 } }));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
        [modalQueryParameterName]: modalUrlName,
    });

    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(section));
  });

  // for test coverage
  it('doesnt set selected section if section is undefined', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });
    const spySection = jest.spyOn(archiveTreeUtils, 'findArchiveTreeNodeById').mockReturnValue(undefined);

    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(spySection).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(setSelectedSection(section));
  });

  it('doesnt set selected section if there are no practice questions', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    const mockSummaryResponseWithoutQuestions = { countsPerSource: {} };

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponseWithoutQuestions);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });
    const spySection = jest.spyOn(archiveTreeUtils, 'findArchiveTreeNodeById');

    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponseWithoutQuestions));
    expect(spySection).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(setSelectedSection(section));
  });

  it('doesnt set selected section if there is no modal query', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);

    const spySection = jest.spyOn(archiveTreeUtils, 'findArchiveTreeNodeById');

    await hook();

    const section = archiveTreeUtils.findArchiveTreeNodeById(book.tree, shortPage.id) as LinkedArchiveTreeSection;

    expect(getSummary).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
    expect(spySection).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(setSelectedSection(section));
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

describe('loadPracticeQuestionsSummaryHookBody', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookBody: ReturnType<typeof import ('./locationChange').loadPracticeQuestionsSummaryHookBody>;
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

    hookBody = (require('./locationChange').loadPracticeQuestionsSummaryHookBody)(helpers);
  });

  it('fetches pq summary when received feature flags only once', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const getSummary = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(mockSummaryResponse);
    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });

    await hookBody();

    await hookBody();

    expect(getSummary).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(receivePracticeQuestionsSummary(mockSummaryResponse));
  });

  it('does not dispatch setSelectedSection if it is already set', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    store.dispatch(setSelectedSection({ id: 'asd' } as any));

    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });

    await hookBody();

    expect(dispatch).not.toHaveBeenCalledWith(setSelectedSection(expect.anything()));
  });

  it('does not dispatch receivePracticeQuestionsSummary if there are none', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    jest.spyOn(navigationSelectors, 'query').mockReturnValueOnce({
      [modalQueryParameterName]: modalUrlName,
    });

    jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestionsBookSummary')
      .mockResolvedValue(undefined);

    await hookBody();

    expect(dispatch).not.toHaveBeenCalledWith(receivePracticeQuestionsSummary(expect.anything()));
  });
});
