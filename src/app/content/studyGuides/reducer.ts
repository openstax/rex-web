import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import { modalQueryParameterName } from '../constants';
import updateSummaryFilters from '../highlights/utils/updateSummaryFilters';
import * as actions from './actions';
import { highlightStyles, modalUrlName } from './constants';
import { State } from './types';

export const initialState: State = {
  summary: {
    filters: {
      colors: highlightStyles.map(({label}) => label),
      default: true,
      locationIds: [],
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
      const summaryShouldBeOpen = action.payload.query[modalQueryParameterName] === modalUrlName
        && action.payload.action === 'PUSH';

      return {...state, summary: {...state.summary, open: summaryShouldBeOpen}};
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
    case getType(actions.setDefaultSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {...state.summary.filters, ...action.payload},
          loading: true,
          pagination: null,
          studyGuides: {},
        },
      };
    }
    case getType(actions.setSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {...state.summary.filters, ...action.payload, default: false},
          loading: true,
          pagination: null,
          studyGuides: {},
        },
      };
    }
    case getType(actions.updateSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {...updateSummaryFilters(state.summary.filters, action.payload), default: false},
          loading: true,
          pagination: null,
          studyGuides: {},
        },
      };
    }
    case getType(actions.receiveStudyGuidesTotalCounts):
      return {
        ...state,
        summary: {
          ...state.summary,
          totalCountsPerPage: action.payload,
        },
      };
    case getType(actions.receiveSummaryStudyGuides): {
      // Check if filters wasn't updated while we were loading response.
      // It may happen if user with slow network connection change filters very fast.
      if (action.meta.filters && state.summary.filters !== action.meta.filters) { return state; }

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
