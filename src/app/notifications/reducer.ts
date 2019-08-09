import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { State } from './types';
import { isMatch, find, pick, flow, isUndefined,
  // overEvery
} from 'lodash/fp';
// import dateFns from 'date-fns';

export const initialState = [];

function isNotInNotifications(state: State, action: AnyAction) {
  // @ts-ignore
  const actionIdentifiers = pick([
    ['type'],
    ['payload', 'id'],
  ])(action)

  return flow(
    // @ts-ignore
    find(
      isMatch(actionIdentifiers)
    ),
    isUndefined,
  )(state)
}

// function isCurrent(state: State, action: AnyAction) {
  
// }

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.updateAvailable):
    case getType(actions.acceptCookies):
      return state.find(({type}) => type === action.type)
        ? state
        : [...state, action];
    case getType(actions.appMessage):
      return isNotInNotifications(state, action)
        ? [...state, action]
        : state;
    case getType(actions.dismissNotification):
      return state.filter((notification) => notification !== action.payload);
    default:
      return state;
  }
};

export default reducer;
