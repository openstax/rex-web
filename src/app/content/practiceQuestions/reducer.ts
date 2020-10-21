import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { AnyAction } from '../../types';
import { practiceQuestionsFeatureFlag } from '../constants';
import { receivePracticeQuestionsSummary } from './actions';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(practiceQuestionsFeatureFlag)};
    case getType(receivePracticeQuestionsSummary):
      return {...state, summary: action.payload};
    default:
      return state;
  }
};

export default reducer;
