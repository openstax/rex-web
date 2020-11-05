import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { getParamFromQuery } from '../../navigation/utils';
import { AnyAction } from '../../types';
import { modalQueryParameterName, practiceQuestionsFeatureFlag } from '../constants';
import { closePracticeQuestions, openPracticeQuestions, receivePracticeQuestionsSummary } from './actions';
import { modalUrlName } from './constants';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
  open: false,
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(locationChange):
      const shouldBeOpen =
        getParamFromQuery(modalQueryParameterName, action.payload.location.search) === modalUrlName
          && action.payload.action === 'PUSH';

      return {...state, open: shouldBeOpen};
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(practiceQuestionsFeatureFlag)};
    case getType(openPracticeQuestions):
      return {...state, open: true};
    case getType(closePracticeQuestions):
      return {...state, open: false};
    case getType(receivePracticeQuestionsSummary):
      return {...state, summary: action.payload};
    default:
      return state;
  }
};

export default reducer;
