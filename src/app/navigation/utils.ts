import {Location} from 'history';
import pathToRegexp, {Key} from 'path-to-regexp';
import {Dispatch} from 'redux';
import * as actions from './actions';
import {Match} from './types';

export const matchForRoute = (route: string, match?: Match): match is Match => !!match && match.route.name === route;

export const findRouteMatch = (routes: Route[], pathname: string): {route: Route, params: any} | undefined => {
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

export const init = (routes: Route[], location: Location, dispatch: Dispatch) => {
  const match = findRouteMatch(routes, location.pathname);
  dispatch(actions.locationChange({location, match}));
};
