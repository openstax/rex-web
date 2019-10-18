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
  highlights: [],
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(receiveFeatureFlags): {
      return {...state, enabled: action.payload.includes(highlightingFeatureFlag)};
    }
    case getType(locationChange): {
      return {...initialState, enabled: state.enabled};
    }
    case getType(actions.createHighlight): {
      return {...state, highlights: [...state.highlights, action.payload]};
    }
    case getType(actions.updateHighlight): {
      return {
        ...state,
        highlights: state.highlights.map((highlight) =>
          highlight.id === action.payload.id ? action.payload : highlight
        ),
      };
    }
    case getType(actions.deleteHighlight): {
      return {...state, highlights: state.highlights.filter(({id}) => id !== action.payload)};
    }
    case getType(actions.receiveHighlights): {
      return {...state, highlights: [...state.highlights, ...action.payload]};
    }
    default:
      return state;
  }
};

export default reducer;
