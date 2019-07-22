import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { State } from './types';

export const initialState = {
  loading: false,
  open: false,
  query: null,
  results: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.requestSearch): {
      return {...initialState, loading: true, query: action.payload, open: true};
    }
    case getType(actions.receiveSearchResults): {
      return {...state, loading: false, results: action.payload, open: true};
    }
    case getType(actions.clearSearch): {
      return initialState;
    }
    case getType(locationChange): {
      return action.payload.action === 'PUSH' && !action.payload.location.state.search
        ? initialState
        : state;
    }
    case getType(actions.toggleSearchSidebar): {
      return {...state, open: action.payload};
    }
    default:
      return state;
  }
};

export default reducer;
