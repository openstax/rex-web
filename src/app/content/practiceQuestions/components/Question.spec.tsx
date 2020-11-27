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
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { nextQuestion, setAnswer, setQuestions, setSelectedSection } from '../actions';
import { PracticeQuestion } from '../types';
import Answer from './Answer';
import Question from './Question';

jest.mock('../../components/ContentExcerpt', () => (props: any) => <div data-mock-content-excerpt {...props} />);

describe('Question', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;
  let linkedArchiveTreeSection: LinkedArchiveTreeSection;
  let dispatch: jest.SpyInstance;
  const mockQuestion = {
    answers: [
      {
        content_html: '<span data-math=\'25\'>25</span>',
        correctness: '0.0',
        feedback_html: '...',
        id: 273729,
      },
      {
        content_html: '<span data-math=\'26\'>26</span>',
        correctness: '1.0',
        feedback_html: 'Iron is most strongly bound nuclide.',
        id: 273730,
      },
    ],
    group_uuid: 'd95384f2-1330-4582-9d81-1af0eae17b48',
    stem_html: 'What is the atomic number of the most strongly bound nuclide?',
    tags: 'd95384f2-1330-4582-9d81-1af0eae17b48',
    uid: '11591@5',
  } as PracticeQuestion;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    dispatch = jest.spyOn(store, 'dispatch');
    render = () => <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Question />
        </MessageProvider>
      </Services.Provider>
    </Provider>;
    linkedArchiveTreeSection = assertDefined(
      findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid'),
      'mock file has been changed'
    ) as LinkedArchiveTreeSection;
  });

  it('renders null if there is no current question', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null if there is no selected section question', () => {
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());
    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders properly', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('submit is active after selecting an answer', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const submit = component.root.findByProps({ value: 'Submit' });
    expect(submit.props.disabled).toEqual(true);

    const [firstAnswer] = component.root.findAllByType(Answer);
    const input = firstAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    expect(submit.props.disabled).toEqual(false);
  });

  it('clicking skip works', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const skip = component.root.findByProps({ value: 'Skip' });

    act(() => {
      skip.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(setAnswer({ questionId: mockQuestion.uid, answer: null }));
    expect(dispatch).toHaveBeenCalledWith(nextQuestion());
  });

  it('after submitting incorrect answer there is Show answer button that works', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const submit = component.root.findByProps({ value: 'Submit' });
    expect(submit.props.disabled).toEqual(true);

    const [firstAnswer, secondAnswer] = component.root.findAllByType(Answer);
    const input = firstAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    form.props.onSubmit({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setAnswer({ questionId: mockQuestion.uid, answer: mockQuestion.answers[0] }));
    expect(() => firstAnswer.findByProps({ id: 'i18n:practice-questions:popup:incorrect' })).not.toThrow();
    expect(() => secondAnswer.findByProps({ id: 'i18n:practice-questions:popup:correct' })).toThrow();

    const showAnswer = component.root.findByProps({ value: 'Show answer' })!;

    act(() => {
      showAnswer.props.onClick();
    });

    expect(() => secondAnswer.findByProps({ id: 'i18n:practice-questions:popup:correct' })).not.toThrow();
    expect(() => component.root.findByProps({ value: 'Show answer' })).toThrow();
  });
});
