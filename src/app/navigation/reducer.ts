import { Location } from 'history';
import queryString from 'query-string';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveDeleteHighlight } from '../content/highlights/actions';
import { isHighlightScrollTarget } from '../content/highlights/guards';
import { AnyAction } from '../types';
import * as actions from './actions';
import { GenericMatch, State } from './types';
import { getScrollTargetFromQuery } from './utils';

const addQuery = (location: Location, match?: GenericMatch) => ({
  ...location,
  match,
  query: queryString.parse(location.search),
});

export default (location: Location): Reducer<State, AnyAction> => (state = addQuery(location), action) => {
  switch (action.type) {
    case getType(actions.locationChange):
      return addQuery(action.payload.location, action.payload.match);
    case getType(receiveDeleteHighlight): {
      const scrollTarget = getScrollTargetFromQuery(state.query, state.hash);
      if (scrollTarget && isHighlightScrollTarget(scrollTarget) && scrollTarget.id === action.payload.id) {
        return {...state, search: '', hash: '', query: {}};
      }
      return state;
    }
    default:
      return state;
  }
};
