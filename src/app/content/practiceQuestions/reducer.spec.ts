import * as actions from './actions';
import reducer, { initialState } from './reducer';

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
});
