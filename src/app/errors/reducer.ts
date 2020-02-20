import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as navigation from '../navigation';
import { AnyAction } from '../types';
import { clearCurrentError, recordError } from './actions';
import { isExternalError } from './guards';
import { notFound } from './routes';
import { State } from './types';
import { getNewErrorStack } from './utils';

export const initialState: State = {
  errorIdStack: [],
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(clearCurrentError):
      return initialState;
    case getType(recordError): {
      const { payload } = action;

      if (isExternalError(payload)) {
        return {
          ...state,
          code: 500,
          error: payload.error,
          errorIdStack: getNewErrorStack(state.errorIdStack, payload.sentryErrorId),
        };
      }

      return {
        ...state,
        errorIdStack: getNewErrorStack(state.errorIdStack, payload.sentryErrorId),
      };
    }

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
