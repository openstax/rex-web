import { History } from 'history';
import queryString from 'query-string';
import { getType } from 'typesafe-actions';
import { external, notFound } from '../errors/routes';
import { AnyAction, Dispatch, Middleware } from '../types';
import { assertWindow } from '../utils/browser-assertions';
import * as actions from './actions';
import { systemQueryParameters } from './selectors';
import { AnyRoute } from './types';
import { changeToLocation, matchForRoute, matchPathname, matchSearch, matchUrl } from './utils';

export default (routes: AnyRoute[], history: History): Middleware => ({getState, dispatch}) => {
  history.listen(changeToLocation(routes, dispatch));

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    if (matchForRoute(notFound, action.payload) || matchForRoute(external, action.payload)) {
      const { location } = assertWindow();
      const method = action.payload.method === 'push'
        ? location.assign.bind(location)
        : location.replace.bind(location);

      method(matchUrl(action.payload, queryString.parse(action.payload.search || '')));
      return;
    }

    const locationState = {...action.payload.state, depth: history.location.state?.depth || 0};

    if (action.payload.method === 'push') {
      locationState.depth++;
    }

    history[action.payload.method]({
      hash: action.payload.hash,
      pathname: matchPathname(action.payload),
      search: matchSearch(
        action.payload,
        {
          ...systemQueryParameters(getState()),
          ...queryString.parse(action.payload.search || ''),
        }),
      state: locationState,
    });
  };
};
