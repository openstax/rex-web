import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { AnyAction } from '../../types';
import { practiceQuestionsFeatureFlag } from '../constants';
import { closePracticeQuestions, openPracticeQuestions } from './actions';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
  open: false,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(practiceQuestionsFeatureFlag)};
    case getType(openPracticeQuestions):
      return {...state, open: true};
    case getType(closePracticeQuestions):
      return {...state, open: false};
    default:
      return state;
  }
};

export default reducer;
