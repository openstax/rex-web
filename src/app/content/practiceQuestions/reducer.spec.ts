import { locationChange } from '../../navigation/actions';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('practice questions reducer', () => {
  it('keeps modal open on location change if modal query is present', () => {
    const mockState = {
      ...initialState,
      open: true,
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: '?modal=PQ'}} as any));
    expect(state.open).toBe(true);
  });

  it('closes modal on location change if modal query is not present', () => {
    const mockState = {
      ...initialState,
      open: true,
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: ''}} as any));
    expect(state.open).toBe(false);
  });

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
