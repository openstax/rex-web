import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveStudyGuides): {
      return {
        summary: action.payload,
      };
    }
    default:
      return state;
  }
};

export default reducer;
