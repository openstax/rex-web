import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook } from '../../actions';
import { LinkedArchiveTreeSection } from '../../types';
import { formatBookData } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { setQuestions, setSelectedSection } from '../actions';
import { PracticeQuestions } from '../types';

const section = findArchiveTreeNodeById(book.tree, pageInChapter.id) as LinkedArchiveTreeSection;

describe('setSelectedSectionHook', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./setSelectedSectionHook').hookBody>;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./setSelectedSectionHook').hookBody)(helpers);
  });

  it('fetch questions for selected section', async() => {
    const mockedQuestions = [{}, {}] as any as PracticeQuestions;

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const spyLoad = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestions')
      .mockResolvedValue(mockedQuestions);

    await hook(setSelectedSection(section));

    expect(spyLoad).toHaveBeenCalledWith(book.id, section.id);
    expect(dispatch).toHaveBeenCalledWith(setQuestions(mockedQuestions));
  });

  it('set questions to an empty array if there are no questions for given section', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const spyLoad = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestions')
      .mockResolvedValue(undefined);

    await hook(setSelectedSection(section));

    expect(spyLoad).toHaveBeenCalledWith(book.id, section.id);
    expect(dispatch).toHaveBeenCalledWith(setQuestions([]));
  });

  it('noops if there is no book', async() => {
    const spyLoad = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestions')
      .mockResolvedValue(undefined);

    await hook(setSelectedSection(section));

    expect(spyLoad).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if section is null', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const spyLoad = jest.spyOn(helpers.practiceQuestionsLoader, 'getPracticeQuestions')
      .mockResolvedValue(undefined);

    await hook(setSelectedSection(null));

    expect(spyLoad).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
