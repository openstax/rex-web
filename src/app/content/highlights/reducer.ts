import { Highlight, HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { highlightingFeatureFlag, highlightStyles } from './constants';
import { State } from './types';
import {
  addOneToTotalCounts,
  addSummaryHighlight,
  getHighlightByIdFromHighlights,
  getHighlightByIdFromSummaryHighlights,
  removeOneFromTotalCounts,
  removeSummaryHighlight,
  updateHighlights,
  updateSummaryHighlightsDependOnFilters,
} from './utils';

const defaultColors = highlightStyles.map(({label}) => label);
export const initialState: State = {
  enabled: false,
  highlights: null,
  myHighlightsOpen: false,
  summary: {
    filters: {colors: defaultColors, locationIds: []},
    highlights: {},
    loading: false,
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

      let newSummaryHighlights;
      if (state.summary.filters.colors.includes(highlight.color)) {
        newSummaryHighlights = addSummaryHighlight(state.summary.highlights, {
          ...action.meta,
          highlight,
        });
      }

      const { pageId } = action.meta;
      const totalCountsPerPage = addOneToTotalCounts(state.summary.totalCountsPerPage || {}, pageId);

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
      if (!state.highlights) { return state; }

      const currentHighlight = getHighlightByIdFromHighlights(state.highlights, action.payload.id)
        || getHighlightByIdFromSummaryHighlights(state.summary.highlights, action.payload.id);
      if (!currentHighlight) { return state; }

      const highlights = updateHighlights(state.highlights, action.payload);

      const newSummaryHighlights = updateSummaryHighlightsDependOnFilters(
        state.summary.highlights,
        state.summary.filters,
        {...action.meta,
          highlight: {...currentHighlight, ...action.payload.highlight} as Highlight,
        });

      return {
        ...state,
        highlights,
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
        },
      };
    }
    case getType(actions.deleteHighlight): {
      if (!state.highlights) {
        return state;
      }

      const newSummaryHighlights = removeSummaryHighlight(state.summary.highlights, {
        ...action.meta,
        id: action.payload,
      });

      const { pageId } = action.meta;
      const totalCountsPerPage = removeOneFromTotalCounts(state.summary.totalCountsPerPage || {}, pageId);

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
      return {...state, highlights: [...state.highlights || [], ...action.payload],
        summary: {...state.summary, loading: false},
      };
    }
    case getType(actions.focusHighlight): {
      return {...state, focused: action.payload};
    }
    case getType(actions.clearFocusedHighlight): {
      return omit('focused', state);
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
          loading: true,
        },
      };
    }
    case getType(actions.receiveSummaryHighlights): {
      return {
        ...state,
        summary: {
          ...state.summary,
          highlights: action.payload,
          loading: false,
        },
      };
    }
    case getType(actions.receiveHighlightsTotalCounts): {
      return {
        ...state,
        summary: {
          ...state.summary,
          totalCountsPerPage: action.payload,
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
