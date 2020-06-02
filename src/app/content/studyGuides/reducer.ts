import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { AnyAction } from '../../types';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
  open: false,
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveStudyGuides): {
      return {...state, summary: action.payload };
    }
    case getType(receiveFeatureFlags): {
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
    }
    case getType(actions.openStudyGuides):
      return {...state, open: true };
    case getType(actions.closeStudyGuides):
      return {...state, open: false };
    default:
      return state;
  }
};

export default reducer;
