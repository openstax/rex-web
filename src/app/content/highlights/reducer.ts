import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  enabled: false,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {

  switch (action.type) {
    case getType(actions.enableHighlighting): {
      return {...state, enabled: true};
    }
    default:
      return state;
  }
};

export default reducer;
