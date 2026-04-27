import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { modalQueryParameterName } from '../content/constants';
import * as navigation from '../navigation';
import { AnyAction } from '../types';
import * as actions from './actions';
import { modalUrlName } from './constants';
import { external, notFound } from './routes';
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
    case getType(navigation.actions.locationChange): {
      const hasModalQuery = action.payload.query[modalQueryParameterName] === modalUrlName;
      const isNotFound = navigation.utils.matchForRoute(notFound, action.payload.match)
        || navigation.utils.matchForRoute(external, action.payload.match)
        || action.payload.match === undefined;

      return {
        ...state,
        code: isNotFound ? 404 : 200,
        showDialog: hasModalQuery,
      };
    }
    default:
      return state;
  }
};

export default reducer;
