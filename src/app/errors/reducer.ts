import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as navigation from '../navigation';
import { AnyAction } from '../types';
import { clearCurrentError, recordError, recordSentryMessage } from './actions';
import { notFound } from './routes';
import { State } from './types';

export const initialState: State = {
  sentryMessageIdStack: [],
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(clearCurrentError):
      return initialState;
    case getType(recordError):
      return { ...state, error: action.payload, code: 500 };
    case getType(recordSentryMessage):
      return { ...state, sentryMessageIdStack: [ action.payload, ...state.sentryMessageIdStack] };
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
