import { Highlight, HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import * as actions from './actions';
import { highlightingFeatureFlag, highlightStyles } from './constants';
import { State } from './types';
import {
  addToTotalCounts,
  getHighlightColorFiltersWithContent,
  getHighlightLocationFiltersWithContent,
  removeFromTotalCounts,
  removeSummaryHighlight,
  updateInTotalCounts,
  updateSummaryHighlightsDependOnFilters
} from './utils';

const defaultColors = highlightStyles.map(({label}) => label);
export const initialState: State = {
  enabled: false,
  hasUnsavedHighlight: false,
  highlights: null,
  myHighlightsOpen: false,
  shouldShowDiscardModal: false,
  summary: {
    filters: {colors: defaultColors, locationIds: []},
    highlights: null,
    loading: false,
    pagination: null,
    totalCountsPerPage: null,
  },
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(receiveFeatureFlags): {
      return {...state, enabled: action.payload.includes(highlightingFeatureFlag)};
    }
    case getType(locationChange): {
      return {...initialState, enabled: state.enabled, myHighlightsOpen: false,
        summary: {...state.summary, loading: true},
      };
    }
    case getType(actions.createHighlight): {
      const highlight = {
        ...action.payload,
        color: action.payload.color as string as HighlightColorEnum,
        sourceType: action.payload.sourceType as string as HighlightSourceTypeEnum,
      };

      const newSummaryHighlights = state.summary.highlights
        ? updateSummaryHighlightsDependOnFilters(
          state.summary.highlights,
          state.summary.filters,
          {...action.meta, highlight })
        : state.summary.highlights;

      const totalCountsPerPage = state.summary.totalCountsPerPage
        ? addToTotalCounts(state.summary.totalCountsPerPage, highlight)
        : state.summary.totalCountsPerPage;

      return {
        ...state,
        hasUnsavedHighlight: false,
        highlights: [...state.highlights || [], highlight],
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights || state.summary.highlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.openMyHighlights):
      return {...state, myHighlightsOpen: true};
    case getType(actions.closeMyHighlights):
      return {...state, myHighlightsOpen: false};
    case getType(actions.updateHighlight): {
      if (!state.highlights) { return state; }

      const oldHiglightIndex = state.highlights.findIndex(
        (highlight) => highlight.id === action.payload.id);
      if (oldHiglightIndex < 0) { return state; }

      const oldHighlight = state.highlights[oldHiglightIndex];

      const newHighlight = {
        ...oldHighlight,
        ...action.payload.highlight,
      } as Highlight;

      const newHighlights = [...state.highlights];
      newHighlights[oldHiglightIndex] = newHighlight;

      const newSummaryHighlights = state.summary.highlights
        ? updateSummaryHighlightsDependOnFilters(
          state.summary.highlights,
          state.summary.filters,
          {...action.meta, highlight: newHighlight})
        : state.summary.highlights
      ;

      const totalCountsPerPage = state.summary.totalCountsPerPage
        ? updateInTotalCounts(state.summary.totalCountsPerPage, oldHighlight, newHighlight)
        : state.summary.totalCountsPerPage
      ;

      return {
        ...state,
        hasUnsavedHighlight: false,
        highlights: newHighlights,
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.deleteHighlight): {
      if (!state.highlights) {
        return state;
      }

      const [newSummaryHighlights, removedHighlight] = state.summary.highlights
        ? removeSummaryHighlight(state.summary.highlights, {
          ...action.meta,
          id: action.payload,
        })
        : [state.summary.highlights, null]
      ;

      const totalCountsPerPage = state.summary.totalCountsPerPage && removedHighlight
        ? removeFromTotalCounts(state.summary.totalCountsPerPage, removedHighlight)
        : state.summary.totalCountsPerPage
      ;

      return {
        ...state,
        focused: state.focused === action.payload ? undefined : state.focused,
        hasUnsavedHighlight: false,
        highlights: state.highlights.filter(({id}) => id !== action.payload),
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.receiveHighlights): {
      return {...state, highlights: [...state.highlights || [], ...action.payload],
        summary: {...state.summary, loading: false},
      };
    }
    case getType(actions.focusHighlight): {
      return {...state, focused: action.payload, hasUnsavedHighlight: false };
    }
    case getType(actions.clearFocusedHighlight): {
      return state.hasUnsavedHighlight ? state : omit('focused', state);
    }
    case getType(actions.editStateChange): {
      return {
        ...state,
        hasUnsavedHighlight: action.payload,
      };
    }
    case getType(actions.toggleDiscardHighlightModal): {
      return {
        ...state,
        shouldShowDiscardModal: action.payload,
      };
    }
    case getType(actions.discardHighlightChanges): {
      return {
        ...omit('focused', state),
        hasUnsavedHighlight: false,
        shouldShowDiscardModal: false,
      };
    }
    case getType(actions.initializeMyHighlightsSummary):
    case getType(actions.loadMoreSummaryHighlights): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: true,
        },
      };
    }
    case getType(actions.setSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {
            ...state.summary.filters,
            ...action.payload,
          },
          highlights: {},
          loading: true,
          pagination: null,
        },
      };
    }
    case getType(actions.receiveSummaryHighlights): {
      return {
        ...state,
        summary: {
          ...state.summary,
          highlights: merge(state.summary.highlights || {}, action.payload),
          loading: false,
          pagination: action.meta,
        },
      };
    }
    case getType(actions.receiveHighlightsTotalCounts): {
      const locationIds = Array.from(getHighlightLocationFiltersWithContent(action.meta, action.payload));
      const colors = Array.from(getHighlightColorFiltersWithContent(action.payload));

      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {
            colors,
            locationIds,
          },
          totalCountsPerPage: action.payload,
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
