import { content } from '../../content/routes';
import { locationChange } from '../../navigation/actions';
import { assertWindow } from '../../utils';
import { LinkedArchiveTreeSection } from '../types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import { PracticeQuestions, QuestionAnswers } from './types';

describe('practice questions reducer', () => {
  it('reduces nextQuestion when currentQuestionIndex is null', () => {
    const state = {
      ...initialState,
      currentQuestionIndex: null,
    };

    const newState = reducer(state, actions.nextQuestion());

    expect(newState.currentQuestionIndex).toEqual(0);
  });

  it('reduces nextQuestion when currentQuestionIndex is a number', () => {
    const state = {
      ...initialState,
      currentQuestionIndex: 0,
    };

    const newState = reducer(state, actions.nextQuestion());

    expect(newState.currentQuestionIndex).toEqual(1);
  });

  it('reduces locationChange', () => {
    const state = {
      ...initialState,
      currentQuestionIndex: 1,
      questionAnswers: { asd: { id: 'answer1' } } as any as QuestionAnswers,
      questions: [{ uid: 'asd' }, { uid: 'afs' }] as PracticeQuestions,
      selectedSection: { title: 'some title' } as LinkedArchiveTreeSection,
    };

    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        pathname: '/books/book-slug-1/pages/doesnotmatter',
        state: {},
      },
      match: {
        params: {
          book: { slug: 'book' },
          page: { slug: 'page' },
        },
        route: content,
      },
    } as any));

    expect(newState.currentQuestionIndex).toEqual(initialState.currentQuestionIndex);
    expect(newState.questionAnswers).toEqual(initialState.questionAnswers);
    expect(newState.questions).toEqual(initialState.questions);
    expect(newState.selectedSection).toEqual(initialState.selectedSection);
    expect(newState.loading).toBe(true);
  });
});
