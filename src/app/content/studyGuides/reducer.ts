import merge from 'lodash/fp/merge';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { highlightStyles } from './constants';
import { State } from './types';

const defaultColors = highlightStyles.map(({label}) => label);
export const initialState: State = {
  isEnabled: false,
  summary: {
    filters: {colors: defaultColors, locationIds: []},
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
    case getType(actions.setSummaryFilters): {
      return {
        ...state,
        summary: {
        ...state.summary,
        filters: {
          ...state.summary.filters,
          ...action.payload,
        },
          loading: true,
          pagination: null,
          studyGuides: {},
        },
      };
    }
    case getType(actions.receiveStudyGuidesTotalCounts):
      const locationIds = Array.from(action.meta.keys());
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {
            ...state.summary.filters,
            locationIds,
          },
          totalCountsPerPage: action.payload,
        },
      };
    case getType(actions.receiveSummaryStudyGuides): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: Boolean(action.meta.isStillLoading),
          pagination: action.meta.pagination,
          studyGuides: merge(state.summary.studyGuides || {}, action.payload),
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
