import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { receiveBook } from '../../actions';
import ContentLink from '../../components/ContentLink';
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { setQuestionIndex, setQuestions, setSelectedSection } from '../actions';
import { PracticeQuestion } from '../types';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';
import ShowPracticeQuestions, {
  QuestionsHeader,
  QuestionsWrapper,
  SectionTitle,
} from './ShowPracticeQuestions';

jest.mock('./IntroScreen', () => <div data-mock-intro-section />);
jest.mock('../../components/ContentLink', () => ({
  ...jest.requireActual('../../components/ContentLink'),
  default: () => <a data-mock-content-link />,
}));

describe('ShowPracticeQuestions', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;
  let linkedArchiveTreeSection: LinkedArchiveTreeSection;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    render = () => <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ShowPracticeQuestions />
        </MessageProvider>
      </Services.Provider>
    </Provider>;
    linkedArchiveTreeSection = assertDefined(
      findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid'),
      'mock file has been changed'
    ) as LinkedArchiveTreeSection;
  });

  it('renders only a few components when there is no book and no selected section', () => {
    const component = renderer.create(render());

    expect(() => component.root.findByType(SectionTitle)).toThrow();
    expect(() => component.root.findByType(ContentLink)).toThrow();
    expect(() => component.root.findByType(QuestionsWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionsHeader)).not.toThrow();
    expect(() => component.root.findByType(ProgressBar)).not.toThrow();
  });

  it('renders general components when there is a book and selected section', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));

    const component = renderer.create(render());

    expect(() => component.root.findByType(SectionTitle)).not.toThrow();
    expect(() => component.root.findByType(QuestionsWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionsHeader)).not.toThrow();
    expect(() => component.root.findByType(ContentLink)).not.toThrow();
    expect(() => component.root.findByType(ProgressBar)).not.toThrow();
  });

  it('renders Intro screen', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));
    store.dispatch(setQuestionIndex(null));

    const component = renderer.create(render());

    expect(() => component.root.findByType(IntroScreen)).not.toThrow();
    expect(() => component.root.findByType(SectionTitle)).not.toThrow();
    expect(() => component.root.findByType(QuestionsWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionsHeader)).not.toThrow();
    expect(() => component.root.findByType(ContentLink)).not.toThrow();
    expect(() => component.root.findByType(ProgressBar)).not.toThrow();
  });
});
