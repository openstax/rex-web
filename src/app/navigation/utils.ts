import { Location } from 'history';
import pathToRegexp, { Key } from 'path-to-regexp';
import { Dispatch } from 'redux';
import { AnyRoute } from '../types';
import * as actions from './actions';
import { Match, Route } from './types';

export const matchForRoute = <P>(route: Route<P>, match?: Match<any>): match is Match<P> => !!match && match.route.name === route.name;

export const findRouteMatch = (routes: AnyRoute[], pathname: string): {route: AnyRoute, params: any} | undefined => {
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

        return {route, params};
      }
    }
  }
};

export const init = (routes: AnyRoute[], location: Location, dispatch: Dispatch) => {
  const match = findRouteMatch(routes, location.pathname);
  dispatch(actions.locationChange({location, match}));
};
