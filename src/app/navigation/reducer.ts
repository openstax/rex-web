import { Location } from 'history';
import queryString from 'query-string';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { hasParams } from './guards';
import { State } from './types';

const addQuery = (location: Location) => ({
  ...location,
  query: queryString.parse(location.search),
});

export default (location: Location): Reducer<State, AnyAction> => (state = addQuery(location), action) => {
  switch (action.type) {
    case getType(actions.locationChange):
      return {
        ...state,
        ...addQuery(action.payload.location),
        ...(action.payload.match && hasParams(action.payload.match) ? {params: action.payload.match.params} : {}),
      };
    default:
      return state;
  }
};
