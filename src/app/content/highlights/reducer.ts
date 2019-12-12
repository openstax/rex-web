import { HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { highlightingFeatureFlag } from './constants';
import { State } from './types';

export const initialState: State = {
  enabled: false,
  highlights: null,
  myHighlightsOpen: false,
  summary: {
    chapterCounts: {},
    filters: {colors: [], chapters: []},
    highlights: {},
    loading: false,
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
      return {...state, highlights: [...state.highlights || [], {
        ...action.payload,
        color: action.payload.color as string as HighlightColorEnum,
        sourceType: action.payload.sourceType as string as HighlightSourceTypeEnum,
      }]};
    }
    case getType(actions.openMyHighlights):
      return {...state, myHighlightsOpen: true};
    case getType(actions.closeMyHighlights):
      return {...state, myHighlightsOpen: false};
    case getType(actions.updateHighlight): {
      if (!state.highlights) {
        return state;
      }

      return {
        ...state,
        highlights: state.highlights.map((highlight) =>
          highlight.id === action.payload.id ? {
            ...highlight,
            ...action.payload.highlight,
            color: action.payload.highlight.color as string as HighlightColorEnum,
          } : highlight
        ),
      };
    }
    case getType(actions.deleteHighlight): {
      if (!state.highlights) {
        return state;
      }

      return {
        ...state,
        focused: state.focused === action.payload ? undefined : state.focused,
        highlights: state.highlights.filter(({id}) => id !== action.payload),
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
    case getType(actions.setColorsFilter): {
      const newState = {...state};
      newState.summary.filters.colors = action.payload;
      return newState
    }
    case getType(actions.setChaptersFilter): {
      const newState = {...state};
      newState.summary.filters.chapters = action.payload;
      return newState
    }
    case getType(actions.setIsLoadingSummary): {
      const newState = {...state};
      newState.summary.loading = action.payload;
      return newState;
    }
    case getType(actions.receiveSummaryHighlights): {
      const newState = {...state};
      newState.summary.highlights = action.payload;
      newState.summary.loading = false;
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
