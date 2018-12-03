import { History } from 'history';
import { getType } from 'typesafe-actions';
import { AnyAction, Dispatch, Middleware } from '../types';
import * as actions from './actions';
import { hasState } from './guards';
import { AnyRoute } from './types';
import { findRouteMatch, historyActionUrl } from './utils';

export default (routes: AnyRoute[], history: History): Middleware => ({dispatch}) => {
  history.listen((location) => {
    const match = findRouteMatch(routes, location);
    dispatch(actions.locationChange({location, match}));
  });

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    history[action.payload.method](
      historyActionUrl(action.payload),
      hasState(action.payload)
        ? action.payload.state
        : undefined
    );
  };
};
