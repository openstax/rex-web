import merge from 'lodash/fp/merge';
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
  summary: {
    highlights: null,
    pagination: null,
  },
  totalCountsPerPage: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveStudyGuides):
      return {...state, summary: {...state.summary, highlights: action.payload, pagination: action.meta}};
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
    case getType(actions.openStudyGuides):
      return {...state, open: true };
    case getType(actions.closeStudyGuides):
      return {...state, open: false };
    case getType(actions.loadMoreStudyGuides):
      return {...state, loading: true};
    case getType(actions.receiveStudyGuidesHighlights): {
      return {
        ...state,
        highlights: merge(state.highlights || {}, action.payload),
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default reducer;
