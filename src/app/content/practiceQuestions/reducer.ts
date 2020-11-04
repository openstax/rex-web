import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { practiceQuestionsFeatureFlag } from '../constants';
import { nextQuestion, receivePracticeQuestionsSummary, setQuestions, setSelectedSection } from './actions';
import { closePracticeQuestions, openPracticeQuestions } from './actions';
import { State } from './types';

export const initialState: State = {
  currentQuestionIndex: null,
  isEnabled: false,
  open: false,
  questions: [],
  selectedSection: null,
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(practiceQuestionsFeatureFlag)};
    case getType(openPracticeQuestions):
      return {...state, open: true};
    case getType(closePracticeQuestions):
      return {...state, open: false, selectedSection: null, questions: [], currentQuestionIndex: null};
    case getType(receivePracticeQuestionsSummary):
      return {...state, summary: action.payload};
    case getType(setSelectedSection):
      return {...state, selectedSection: action.payload, currentQuestionIndex: null, questions: []};
    case getType(nextQuestion):
      return {...state, currentQuestionIndex: state.currentQuestionIndex === null ? 0 : state.currentQuestionIndex + 1};
    case getType(setQuestions):
      return {...state, questions: action.payload};
    case getType(locationChange):
      return {...state, open: false, selectedSection: null, questions: []};
    default:
      return state;
  }
};

export default reducer;
