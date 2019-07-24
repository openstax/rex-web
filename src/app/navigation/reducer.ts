import { Location } from 'history';
import queryString from 'query-string';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { State } from './types';

const addQuery = (location: Location) => ({
  ...location,
  query: queryString.parse(location.search),
});

interface ErrorMaker {
  bang: () => string
}

export default (location: Location): Reducer<State, AnyAction> => (state = addQuery(location), action) => {
  ({} as any as ErrorMaker).bang();

  switch (action.type) {
    case getType(actions.locationChange):
      return addQuery(action.payload.location);
    default:
      return state;
  }
};
