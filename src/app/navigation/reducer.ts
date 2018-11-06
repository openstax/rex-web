import {Reducer} from 'redux';
import {Location} from 'history';
import {State} from './types';
import {getType} from 'typesafe-actions';
import * as actions from './actions';

export default (location: Location): Reducer<State, AnyAction> => (state = location, action) => {
  switch (action.type) {
    case getType(actions.locationChange):
      return action.payload.location;
    default:
      return state;
  };
};

