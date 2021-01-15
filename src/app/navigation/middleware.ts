import { History } from 'history';
import { getType } from 'typesafe-actions';
import { notFound } from '../errors/routes';
import { AnyAction, Dispatch, Middleware } from '../types';
import { assertWindow } from '../utils/browser-assertions';
import * as actions from './actions';
import { AnyRoute } from './types';
import { changeToLocation, matchForRoute, matchSearch, matchUriString, matchUrl } from './utils';

export default (routes: AnyRoute[], history: History): Middleware => ({dispatch}) => {
  history.listen(changeToLocation(routes, dispatch));

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    // special case for notFound because we want to hit the osweb page
    // this could be made more generic with an `external` flag on the
    // route or something
    if (matchForRoute(notFound, action.payload)) {
      const { location } = assertWindow();
      const method = action.payload.method === 'push'
        ? location.assign.bind(location)
        : location.replace.bind(location);

      method(matchUriString(action.payload));
      return;
    }

    history[action.payload.method]({
      hash: action.payload.hash,
      pathname: matchUrl(action.payload),
      search: matchSearch(action.payload, action.payload.search),
      state: action.payload.state,
    });
  };
};
