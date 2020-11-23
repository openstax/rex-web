import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { highlightStyles } from './constants';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
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
    case getType(locationChange):
      return {...state, summary: {...state.summary, open: false}};
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
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
      const newFilters = { ...state.summary.filters };
      const { colors: colorsChange, locations: locationsChange } = action.payload;

      if (colorsChange) {
        newFilters.colors = [
          ...state.summary.filters.colors.filter((color) => !colorsChange.remove.includes(color)),
          ...colorsChange.new,
        ];
      }

      if (locationsChange) {
        newFilters.locationIds = [
          ...state.summary.filters.locationIds.filter(
            (id) => locationsChange.remove.find((location) => id !== location.id)),
          ...locationsChange.new.map((location) => location.id),
        ];
      }

      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {...newFilters, default: false},
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
