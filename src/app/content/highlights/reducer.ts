import { Highlight, HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveLoggedOut } from '../../auth/actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import * as actions from './actions';
import { highlightStyles } from './constants';
import { State } from './types';
import {
  addToTotalCounts,
  removeFromTotalCounts,
  removeSummaryHighlight,
  updateInTotalCounts,
  updateSummaryHighlightsDependOnFilters
} from './utils';
import { findHighlight } from './utils/reducerUtils';

const defaultColors = highlightStyles.map(({label}) => label);
export const initialState: State = {
  highlights: null,
  myHighlightsOpen: false,
  recentlyLoadedFor: null,
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
    case getType(locationChange): {
      return {
        ...initialState,
        highlights: state.recentlyLoadedFor && action.payload.location.state.pageUid === state.recentlyLoadedFor
          ? state.highlights
          : initialState.highlights,
        myHighlightsOpen: false,
        recentlyLoadedFor: state.recentlyLoadedFor,
        summary: {...state.summary},
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
      const oldHighlight = findHighlight(state, action.payload.id);

      if (!state.highlights || !oldHighlight) {
        return state;
      }

      const newHighlight = {
        ...oldHighlight,
        ...action.payload.highlight,
      } as Highlight;

      const newHighlights = state.highlights.map((highlight) => {
        if (highlight.id === oldHighlight.id) { return newHighlight; }
        return highlight;
      });

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
        highlights: newHighlights,
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.deleteHighlight): {
      const highlightToRemove = findHighlight(state, action.payload);

      if (!state.highlights || !highlightToRemove) {
        return state;
      }

      const newSummaryHighlights = state.summary.highlights
        ? removeSummaryHighlight(state.summary.highlights, {
          ...action.meta,
          id: action.payload,
        })
        : state.summary.highlights
      ;

      const totalCountsPerPage = state.summary.totalCountsPerPage && highlightToRemove
        ? removeFromTotalCounts(state.summary.totalCountsPerPage, highlightToRemove)
        : state.summary.totalCountsPerPage
      ;

      return {
        ...state,
        focused: state.focused === action.payload ? undefined : state.focused,
        highlights: state.highlights.filter(({id}) => id !== action.payload),
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.receiveHighlights): {
      return {
        ...state,
        highlights: action.payload.highlights,
        recentlyLoadedFor: action.payload.pageId,
        summary: {...state.summary},
      };
    }
    case getType(actions.focusHighlight): {
      return {...state, focused: action.payload};
    }
    case getType(actions.clearFocusedHighlight): {
      return omit('focused', state);
    }
    case getType(actions.printSummaryHighlights): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: true,
        },
      };
    }
    case getType(actions.toggleSummaryHighlightsLoading): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: action.payload,
        },
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
          loading: Boolean(action.meta.isStillLoading),
          pagination: action.meta.pagination,
        },
      };
    }
    case getType(actions.receiveHighlightsTotalCounts): {
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
    }
    case getType(receiveLoggedOut): {
      return initialState;
    }
    default:
      return state;
  }
};

export default reducer;
