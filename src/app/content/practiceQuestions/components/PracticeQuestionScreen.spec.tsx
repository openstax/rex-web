import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { routes } from '../..';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, shortPage } from '../../../../test/mocks/archiveLoader';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { receiveBook } from '../../actions';
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { receivePracticeQuestionsSummary, setQuestions, setSelectedSection } from '../actions';
import { PracticeQuestion, PracticeQuestions } from '../types';
import { AnswerBlock } from './Answer';
import Question from './Question';

describe('Practice questions screen', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;
  let source: LinkedArchiveTreeSection;

  const mockQuestionData = {
    answers: [
      {
        content_html: 'Yes, we would both view the motion from...',
        correctness: '0.0',
        id: 374182,
      },
      {
        content_html: 'Yes, we would both view the motion...',
        correctness: '1.0',
        id: 374183,
      },
    ],
    id: 91802,
    stem_html: 'If you and a friend are standing side-by-side watching a soccer game...?',
    uuid: '0e1d41f5-f972-4e3c-b054-358edb8a6562',
  };

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    source = findArchiveTreeNodeById(archiveBook.tree, shortPage.id) as LinkedArchiveTreeSection;

    render = () => <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Question question={mockQuestionData as PracticeQuestion} source={source}/>
        </MessageProvider>
      </Services.Provider>
    </Provider>;
  });

  it('renders and styles properly on selecting an answer', () => {
    store.dispatch(receiveBook(archiveBook));
    store.dispatch(setSelectedSection(source));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: { [source.id]: 1 },
    }));
    store.dispatch(setQuestions([mockQuestionData] as PracticeQuestions));

    jest.spyOn(routes.content, 'getUrl').mockReturnValue('/book/book1/page/testbook1-testpage1-uuid');

    const component = renderer.create(render());

    /* selecting an answer */
    const answerBlock = component.root.findAllByType(AnswerBlock)[0];
    expect(answerBlock).toBeDefined();

    renderer.act(() => {
      answerBlock.props.onClick();
    });

    expect(component.toJSON()).toMatchSnapshot();
  });
});
