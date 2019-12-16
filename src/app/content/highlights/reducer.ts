import { HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { highlightingFeatureFlag, highlightStyles } from './constants';
import { State } from './types';

const defaultColors = highlightStyles.map(({label}) => label);
export const initialState: State = {
  enabled: false,
  highlights: null,
  myHighlightsOpen: false,
  summary: {
    chapterCounts: {},
    filters: {colors: defaultColors, chapters: []},
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
      const newState = {...state};

      const highlight = {
        ...action.payload,
        color: action.payload.color as string as HighlightColorEnum,
        sourceType: action.payload.sourceType as string as HighlightSourceTypeEnum,
      };
      newState.highlights = [...state.highlights || [], highlight];

      const { chapterId, pageId } = action.meta;
      const { summary: { highlights } } = newState;
      if (highlights[chapterId]) {
        if (highlights[chapterId][pageId]) {
          highlights[chapterId][pageId].push(highlight);
        } else {
          highlights[chapterId][pageId] = [highlight];
        }
      } else {
        highlights[chapterId] = {
          [pageId]: [highlight],
        };
      }
      return newState;
    }
    case getType(actions.openMyHighlights):
      return {...state, myHighlightsOpen: true};
    case getType(actions.closeMyHighlights):
      return {...state, myHighlightsOpen: false};
    case getType(actions.updateHighlight): {
      if (!state.highlights) {
        return state;
      }

      const newState = {...state};
      const dataToUpdate = {
        ...action.payload.highlight,
        color: action.payload.highlight.color as string as HighlightColorEnum,
      };
      newState.highlights = newState.highlights!.map((h) =>
        h.id === action.payload.id ? {
          ...h,
          ...dataToUpdate,
        } : h);

      const { chapterId, pageId } = action.meta;
      const { summary: { highlights } } = newState;
      if (highlights[chapterId] && highlights[chapterId][pageId]) {
        highlights[chapterId][pageId] = highlights[chapterId][pageId].map((h) =>
          h.id === action.payload.id ? {
            ...h,
            ...dataToUpdate,
          } : h);
      }
      return newState;
    }
    case getType(actions.deleteHighlight): {
      if (!state.highlights) {
        return state;
      }

      const newState = {...state};

      newState.focused  = newState.focused === action.payload ? undefined : state.focused;
      newState.highlights = newState.highlights!.filter(({id}) => id !== action.payload);

      const { chapterId, pageId } = action.meta;
      const { summary: { highlights } } = newState;
      if (highlights[chapterId] && highlights[chapterId][pageId]) {
        highlights[chapterId][pageId] = highlights[chapterId][pageId]
          .filter((h) => h.id !== action.payload);
        if (highlights[chapterId][pageId].length === 0) {
          delete highlights[chapterId][pageId];
        }
        if (Object.keys(highlights[chapterId]).length === 0) {
          delete highlights[chapterId];
        }
      }
      return newState;
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
      const newState = {...state};
      newState.summary.loading = true;
      newState.summary.filters = action.payload;
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
