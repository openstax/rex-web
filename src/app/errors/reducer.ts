import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as navigation from '../navigation';
import { recordError } from './actions';
import { AnyAction } from '../types';
import { notFound } from './routes';
import { State } from './types';

export const initialState = {};

const reducer: Reducer<State, AnyAction> = (state = {}, action) => {
  console.log(action);
  switch (action.type) {
    case getType(recordError):
      return { ...state, error: action.payload };
    case getType(navigation.actions.locationChange):
      return navigation.utils.matchForRoute(notFound, action.payload.match)
        || action.payload.match === undefined
        ? {...state, code: 404}
        : {...state, code: 200};
    default:
      return state;
  }
};

export default reducer;
