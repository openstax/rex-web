import React from 'react';
import {Reducer, Middleware, Dispatch, MiddlewareAPI} from 'redux';
import {connect} from 'react-redux';
import pathToRegexp, {Key} from 'path-to-regexp';
import {Location, History} from 'history';
import {getType, createStandardAction} from 'typesafe-actions';
import * as selectors from './selectors';

export {
  selectors
};

type historyActions =
  {method: 'push', args: {url: string}} |
  {method: 'replace', args: {url: string}};

export interface State extends Location {};

export const actions = {
  callHistoryMethod: createStandardAction('Navigation/callHistoryMethod')<historyActions>(),
  locationChange: createStandardAction('Navigation/locationChange')<{location: State, match?: Match}>(),
};

export type reducer = (state: State, action: AnyAction) => State;

export const createReducer = (location: Location): Reducer<State, AnyAction> => (state = location, action) => {
  switch (action.type) {
    case getType(actions.locationChange):
      return action.payload.location;
    default:
      return state;
  };
};

export const matchForRoute = (route: string, match?: Match): match is Match => !!match && match.route.name === route;

interface Match {
  route: Route;
  params: any;
}

const findRouteMatch = (routes: Route[], pathname: string): {route: Route, params: any} | undefined => {
  for (const route of routes) {
    const keys: Key[] = [];
    const re = pathToRegexp(route.path, keys, {end: true});
    const match = re.exec(pathname);

    if (match) {
      const [, ...values] = match;
      const params = keys.reduce((result, key, index) => {
        const value = values[index] ? decodeURIComponent(values[index]) : values[index];
        return {...result, [key.name]: value};
      }, {});

      return {route, params}
    }
  }
};

export const createMiddleware = (routes: Route[], history: History): Middleware => ({dispatch}: MiddlewareAPI) => {
  history.listen(location => {
    const match = findRouteMatch(routes, location.pathname);
    dispatch(actions.locationChange({location, match}));
  });

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    history[action.payload.method](action.payload.args.url);
  };
};

export const init = (routes: Route[], location: Location, dispatch: Dispatch) => {
  const match = findRouteMatch(routes, location.pathname);
  dispatch(actions.locationChange({location, match}));
};

const connectNavigationProvider = connect((state: RootState) => ({
  pathname: selectors.pathname(state)
}))

export const NavigationProvider = connectNavigationProvider(({routes, pathname}: {routes: Route[], pathname: string}) => {
  const match = findRouteMatch(routes, pathname);

  if (match) {
    return React.createElement(match.route.component);
  } else {
    return null;
  }
});
