import { Location } from 'history';
import pathToRegexp, { Key } from 'path-to-regexp';
import { Dispatch } from 'redux';
import { MiddlewareAPI } from '../types';
import { actionHook } from '../utils';
import * as actions from './actions';
import { AnyMatch, AnyRoute, GenericMatch, Match } from './types';

export const matchForRoute = <R extends AnyRoute>(route: R, match: GenericMatch | undefined): match is Match<R> =>
  !!match && match.route.name === route.name;

export const findRouteMatch = (routes: AnyRoute[], pathname: string): AnyMatch | undefined => {
  for (const route of routes) {
    for (const path of route.paths) {
      const keys: Key[] = [];
      const re = pathToRegexp(path, keys, {end: true});
      const match = re.exec(pathname);

      if (match) {
        const [, ...values] = match;
        const params = keys.reduce((result, key, index) => {
          const value = values[index] ? decodeURIComponent(values[index]) : values[index];
          return {...result, [key.name]: value};
        }, {});

        return {
          route,
          ...(keys.length > 0 ? {params} : {}),
        } as AnyMatch;
      }
    }
  }
};

export const init = (routes: AnyRoute[], location: Location, dispatch: Dispatch) => {
  const match = findRouteMatch(routes, location.pathname);
  dispatch(actions.locationChange({location, match}));
};

type Hook<R extends AnyRoute> = (helpers: MiddlewareAPI) =>
  (locationChange: {location: Location, match: Match<R>}) =>
    Promise<any> | void;

export const routeHook = <R extends AnyRoute>(route: R, body: Hook<R>) =>
  actionHook(actions.locationChange, (stateHelpers) => {
    const boundHook = body(stateHelpers);

    return (action) => {
      if (matchForRoute(route, action.payload.match)) {
        return boundHook({location: action.payload.location, match: action.payload.match});
      }
    };
  });
