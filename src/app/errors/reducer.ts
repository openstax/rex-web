import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as navigation from '../navigation';
import { State } from './types';

const reducer: Reducer<State, AnyAction> = (state = {}, action) => {
  switch (action.type) {
    case getType(navigation.actions.locationChange):
      return navigation.utils.matchForRoute('NotFound', action.payload.match)
        ? {...state, code: 404}
        : {...state, code: undefined};
    default:
      return state;
  }
};

export default reducer;
