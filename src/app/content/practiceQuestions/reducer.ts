import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  currentQuestionIndex: null,
  loading: false,
  questionAnswers: {},
  questions: [],
  selectedSection: null,
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action): State => {
  switch (action.type) {
    case getType(locationChange):
      return {
        ...state,
        currentQuestionIndex: null,
        loading: true,
        questionAnswers: {},
        questions: [],
        selectedSection: null,
      };
    case getType(actions.receivePracticeQuestionsSummary):
      return {...state, summary: action.payload};
    case getType(actions.setSelectedSection):
      return {
        ...state,
        currentQuestionIndex: null,
        loading: true,
        questionAnswers: {},
        questions: [],
        selectedSection: action.payload,
      };
    case getType(actions.nextQuestion):
      return {...state, currentQuestionIndex: state.currentQuestionIndex === null ? 0 : state.currentQuestionIndex + 1};
    case getType(actions.setQuestions):
      return {...state, loading: false, questions: action.payload};
    case getType(actions.setAnswer):
      const { questionId, answer } = action.payload;
      return {
        ...state,
        questionAnswers: {
          ...state.questionAnswers,
          [questionId]: answer,
        },
      };
    case getType(actions.finishQuestions):
      return {...state, currentQuestionIndex: null};
    default:
      return state;
  }
};

export default reducer;
