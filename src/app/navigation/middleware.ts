import { History } from 'history';
import { getType } from 'typesafe-actions';
import { AnyAction, Dispatch, Middleware } from '../types';
import * as actions from './actions';
import { AnyHistoryAction, AnyRoute, HistoryActionWithParams } from './types';
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

    const hasParams = (payload: AnyHistoryAction): payload is HistoryActionWithParams<any> =>
      (payload as HistoryActionWithParams<any>).params !== undefined;

    history[action.payload.method](hasParams(action.payload)
      ? action.payload.route.getUrl(action.payload.params)
      : action.payload.route.getUrl()
    );
  };
};
