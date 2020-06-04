import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { AnyAction } from '../../types';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  highlights: null,
  isEnabled: false,
  loading: false,
  open: false,
  pagination: null,
  summary: null,
  totalCountsPerPage: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveStudyGuides):
      return {...state, summary: action.payload };
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
    case getType(actions.openStudyGuides):
      return {...state, open: true };
    case getType(actions.closeStudyGuides):
      return {...state, open: false };
    case getType(actions.loadMoreStudyGuides):
      return {...state, loading: true};
    default:
      return state;
  }
};

export default reducer;
