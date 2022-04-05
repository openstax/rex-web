import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import { modalQueryParameterName } from '../constants';
import * as actions from './actions';
import { modalUrlName } from './constants';
import { State } from './types';
import { getFiltersFromQuery } from './utils';

export const initialState: State = {
  summary: {
    filters: {
      colors: null,
      locationIds: null,
    },
    loading: false,
    open: false,
    pagination: null,
    studyGuides: null,
    totalCountsPerPage: null,
  },
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(locationChange): {
      const hasModalQuery = action.payload.query[modalQueryParameterName] === modalUrlName;
      const {colors, locationIds} = getFiltersFromQuery(action.payload.query);
      console.log('colors, locIds: ', colors, locationIds);

      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {
            ...state.summary.filters,
            ...{colors: colors ? colors : null},
            ...{locationIds: locationIds ? locationIds : null},
          },
          open: hasModalQuery,
          pagination: hasModalQuery ? null : state.summary.pagination,
          studyGuides: hasModalQuery ? {} : state.summary.studyGuides,
        },
      };
    }
    case getType(actions.openStudyGuides):
      return {...state, summary: {...state.summary, open: true}};
    case getType(actions.closeStudyGuides):
      return {...state, summary: {...state.summary, open: false}};
    case getType(actions.toggleStudyGuidesSummaryLoading):
      return {...state, summary: {...state.summary, loading: action.payload}};
    case getType(actions.printStudyGuides):
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
