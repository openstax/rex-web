import React from 'react';
import { Provider } from 'react-redux';
import renderer, { act } from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { content } from '../../routes';
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { nextQuestion, receivePracticeQuestionsSummary, setQuestions, setSelectedSection } from '../actions';
import { PracticeQuestion } from '../types';
import EmptyScreen from './EmptyScreen';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';
import Question from './Question';
import ShowPracticeQuestions, {
  QuestionsHeader,
  QuestionsWrapper,
  SectionTitle,
} from './ShowPracticeQuestions';

jest.mock('./IntroScreen', () => (props: any) => <div data-mock-intro-section {...props} />);
jest.mock('./Question', () => (props: any) => <div data-mock-quesiton {...props} />);

describe('ShowPracticeQuestions', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;
  let linkedArchiveTreeSection: LinkedArchiveTreeSection;
  let linkedArchiveTreeSection2: LinkedArchiveTreeSection;

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
    linkedArchiveTreeSection2 = assertDefined(
      findArchiveTreeNodeById(book.tree, 'testbook1-testpage11-uuid'),
      'mock file has been changed'
    ) as LinkedArchiveTreeSection;
    jest.spyOn(content, 'getUrl')
      .mockReturnValue('mockedUrl');
  });

  it('renders only a few components when there is no book and no selected section', () => {
    const component = renderer.create(render());

    expect(() => component.root.findByType(SectionTitle)).toThrow();
    expect(() => component.root.findByProps({ target: '_blank' })).toThrow();
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
    expect(() => component.root.findByProps({ target: '_blank' })).not.toThrow();
    expect(() => component.root.findByType(ProgressBar)).not.toThrow();
  });

  it('renders Intro screen', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: { [linkedArchiveTreeSection.id]: 3 },
    }));
    store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(IntroScreen)).not.toThrow();

    expect(() => component.root.findByType(SectionTitle)).not.toThrow();
    expect(() => component.root.findByType(QuestionsWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionsHeader)).not.toThrow();
    expect(() => component.root.findByProps({ target: '_blank' })).not.toThrow();
    expect(() => component.root.findByType(ProgressBar)).not.toThrow();
  });

  it('renders EmptyScreen if there is nextSection after selected section', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: {
        [linkedArchiveTreeSection.id]: 3,
        [linkedArchiveTreeSection2.id]: 2,
      },
    }));
    store.dispatch(setQuestions([]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(EmptyScreen)).not.toThrow();
    expect(() => component.root.findByType(IntroScreen)).toThrow();
  });

  it('renders EmptyScreen if there is nextSection after current page', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(linkedArchiveTreeSection as any));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: {
        [linkedArchiveTreeSection.id]: 3,
        [linkedArchiveTreeSection2.id]: 2,
      },
    }));
    store.dispatch(setQuestions([]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(EmptyScreen)).not.toThrow();
    expect(() => component.root.findByType(IntroScreen)).toThrow();
  });

  it('renders Practice Question screen after intro screen', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: { [linkedArchiveTreeSection.id]: 3 },
    }));
    store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    expect(() => component.root.findByType(IntroScreen)).toThrow();

    act(() => {
      store.dispatch(nextQuestion());
    });

    expect(() => component.root.findByType(Question)).not.toThrow();
  });
});
