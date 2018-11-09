import { History } from 'history';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { getType } from 'typesafe-actions';
import * as actions from './actions';
import { AnyRoute } from './types';
import { findRouteMatch } from './utils';

export default (routes: AnyRoute[], history: History): Middleware => ({dispatch}: MiddlewareAPI) => {
  history.listen((location) => {
    const match = findRouteMatch(routes, location.pathname);
    dispatch(actions.locationChange({location, match}));
  });

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    history[action.payload.method](action.payload.url);
  };
};
