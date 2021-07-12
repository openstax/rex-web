import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../../types';
import * as actions from './actions';

import { State } from './types';

export const initialState: State = {
  myPlacements: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveMyPlacements): {
      return {
        ...state,
        myPlacements: action.payload.myPlacements,
      }
    }
    default:
      return state;
  }
};

export default reducer;
