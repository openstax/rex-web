import { History } from 'history';
import { getType } from 'typesafe-actions';
import { AnyAction, Dispatch, Middleware } from '../types';
import * as actions from './actions';
import { AnyRoute } from './types';
import { findRouteMatch } from './utils';

export default (routes: AnyRoute[], history: History): Middleware => ({dispatch}) => {
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
