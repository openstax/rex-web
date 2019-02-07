import { Location } from 'history';
import curry from 'lodash/fp/curry';
import pathToRegexp, { Key } from 'path-to-regexp';
import { Dispatch } from 'redux';
import { actionHook } from '../utils';
import * as actions from './actions';
import { hasParams } from './guards';
import { AnyMatch, AnyRoute, GenericMatch, Match, RouteHookBody, RouteState } from './types';

export const matchForRoute = <R extends AnyRoute>(route: R, match: GenericMatch | undefined): match is Match<R> =>
  !!match && match.route.name === route.name;

const getMatchParams = (keys: Key[], match: RegExpExecArray) => {
  const [, ...values] = match;
  return keys.reduce((result, key, index) => {
    const value = values[index] ? decodeURIComponent(values[index]) : values[index];
    return {...result, [key.name]: value};
  }, {});
};

const formatRouteMatch = <R extends AnyRoute>(route: R, state: RouteState<R>, keys: Key[], match: RegExpExecArray) => ({
  route,
  state,
  ...(keys.length > 0 ? {params: getMatchParams(keys, match)} : {}),
} as AnyMatch);

export const findRouteMatch = (routes: AnyRoute[], location: Location): AnyMatch | undefined => {
  for (const route of routes) {
    for (const path of route.paths) {
      const keys: Key[] = [];
      const re = pathToRegexp(path, keys, {end: true});
      const match = re.exec(location.pathname);

      if (match) {
        return formatRouteMatch(route, location.state, keys, match);
      }
    }
  }
};

export const matchUrl = (action: AnyMatch) => hasParams(action)
  ? action.route.getUrl(action.params)
  : action.route.getUrl();

export const changeToLocation = curry((routes: AnyRoute[], dispatch: Dispatch, location: Location) => {
  const match = findRouteMatch(routes, location);
  dispatch(actions.locationChange({location, match}));
});

export const routeHook = <R extends AnyRoute>(route: R, body: RouteHookBody<R>) =>
  actionHook(actions.locationChange, (stateHelpers) => {
    const boundHook = body(stateHelpers);

    return (action) => {
      if (matchForRoute(route, action.payload.match)) {
        return boundHook({location: action.payload.location, match: action.payload.match});
      }
    };
  });
