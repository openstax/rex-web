import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as navigation from '../navigation';
import { AnyAction } from '../types';
import * as actions from './actions';
import { notFound } from './routes';
import { State } from './types';

export const initialState: State = {
  sentryMessageIdStack: [],
  showDialog: false,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.showErrorDialog):
      return {...state, showDialog: true};
    case getType(actions.hideErrorDialog):
      return initialState;
    case getType(actions.recordError):
      return { ...state, error: action.payload, code: 500 };
    case getType(actions.recordSentryMessage):
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
