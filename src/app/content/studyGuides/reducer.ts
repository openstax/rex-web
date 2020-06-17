import merge from 'lodash/fp/merge';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
  summary: {
    loading: false,
    open: false,
    pagination: null,
    studyGuides: null,
    totalCountsPerPage: null,
  },
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(locationChange):
      return {...state, summary: {...state.summary, open: false}};
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
    case getType(actions.openStudyGuides):
      return {...state, summary: {...state.summary, open: true}};
    case getType(actions.closeStudyGuides):
      return {...state, summary: {...state.summary, open: false}};
    case getType(actions.loadMoreStudyGuides):
      return {...state, summary: {...state.summary, loading: true}};
    case getType(actions.receiveStudyGuidesTotalCounts):
      return {
        ...state,
        summary: {
          ...state.summary,
          totalCountsPerPage: action.payload,
        },
      };
    case getType(actions.receiveSummaryStudyGuides): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: false,
          pagination: action.meta,
          studyGuides: merge(state.summary.studyGuides || {}, action.payload),
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
