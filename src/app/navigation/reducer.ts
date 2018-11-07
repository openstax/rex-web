import { Location } from 'history';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as actions from './actions';
import { State } from './types';

export default (location: Location): Reducer<State, AnyAction> => (state = location, action) => {
  switch (action.type) {
    case getType(actions.locationChange):
      return action.payload.location;
    default:
      return state;
  }
};
