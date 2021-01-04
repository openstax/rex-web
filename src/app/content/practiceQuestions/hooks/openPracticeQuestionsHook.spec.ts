import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { LinkedArchiveTreeSection } from '../../types';
import { formatBookData } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { openPracticeQuestions, receivePracticeQuestionsSummary, setSelectedSection } from '../actions';

describe('openPracticeQuestionsHook', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./openPracticeQuestionsHook').hookBody>;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./openPracticeQuestionsHook').hookBody)(helpers);
  });

  it('set selected section on openPracticeQuestionsHook', async() => {
    const section = findArchiveTreeNodeById(book.tree, pageInChapter.id);

    if (!section) {
      return expect(section).toBeDefined();
    }

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { a: 1, b: 2 } }));

    hook(openPracticeQuestions());

    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(section as LinkedArchiveTreeSection));
  });

  it('noops if there is no book', async() => {
    const section = findArchiveTreeNodeById(book.tree, pageInChapter.id);

    if (!section) {
      return expect(section).toBeDefined();
    }

    store.dispatch(receivePage({...pageInChapter, references: []}));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { a: 1, b: 2 } }));

    hook(openPracticeQuestions());

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if there is no page', async() => {
    const section = findArchiveTreeNodeById(book.tree, pageInChapter.id);

    if (!section) {
      return expect(section).toBeDefined();
    }
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { a: 1, b: 2 } }));

    hook(openPracticeQuestions());

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if there is no practice summary', async() => {
    const section = findArchiveTreeNodeById(book.tree, pageInChapter.id);

    if (!section) {
      return expect(section).toBeDefined();
    }
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...pageInChapter, references: []}));

    hook(openPracticeQuestions());

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if page is somehow a chapter', async() => {
    const chapter = findArchiveTreeNodeById(book.tree, 'testbook1-testchapter1-uuid');

    if (!chapter) {
      return expect(chapter).toBeDefined();
    }
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage(chapter as any));
    store.dispatch(receivePracticeQuestionsSummary({ countsPerSource: { a: 1, b: 2 } }));

    hook(openPracticeQuestions());

    expect(dispatch).not.toHaveBeenCalled();
  });
});
