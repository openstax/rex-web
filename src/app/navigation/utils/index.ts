import { flatten, unflatten } from 'flat';
import { Action, Location, Search } from 'history';
import curry from 'lodash/fp/curry';
import isNull from 'lodash/fp/isNull';
import omit from 'lodash/fp/omit';
import omitBy from 'lodash/fp/omitBy';
import pathToRegexp, { Key, parse } from 'path-to-regexp';
import queryString, { OutputParams } from 'query-string';
import querystring from 'querystring';
import { Dispatch } from 'redux';
import { pathTokenIsKey } from '../../navigation/guards';
import { actionHook } from '../../utils';
import * as actions from '../actions';
import {
  AnyMatch,
  AnyRoute,
  LocationChange,
  Match,
  Route,
  RouteHookBody,
  RouteState,
  ScrollTarget
} from '../types';

export * from './scrollTarget';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "Array.includes" */ 'mdn-polyfills/Array.prototype.includes');
}

const delimiter = '_';

export const matchForRoute = <R extends AnyRoute>(route: R, match: AnyMatch | undefined): match is Match<R> =>
  !!match && match.route?.name === route.name;

export const locationChangeForRoute = <R extends AnyRoute>(
  route: R,
  locationChange: LocationChange
): locationChange is Required<LocationChange<Match<R>>> =>
  !!locationChange.match && locationChange.match.route.name === route.name;

export const getUrlRegexParams = (obj: object): object => flatten(obj, {delimiter});

const getMatchParams = (keys: Key[], match: RegExpExecArray) => {
  const [, ...values] = match;
  return unflatten(keys.reduce((result, key, index) => {
    const value = values[index] ? decodeURIComponent(values[index]) : values[index];
    return {...result, [key.name] : value};
  }, {}), {delimiter});
};

const formatRouteMatch = <R extends AnyRoute>(
  route: R,
  state: RouteState<R>,
  keys: Key[],
  match: RegExpExecArray,
  search?: Search | string
) => ({
  params: getMatchParams(keys, match),
  route,
  state,
  ...(search && {search}),
} as AnyMatch);

export const findRouteMatch = (routes: AnyRoute[], location: Location | string): AnyMatch | undefined => {
  let pathname;
  let search;

  if (typeof location === 'string') {
    try {
      const locationUrl = new URL(location);
      pathname = locationUrl.pathname;
      search = locationUrl.search;
    } catch {
      // location is a string but not a valid URL
      pathname = location;
    }
  } else {
    pathname = location.pathname;
    search = location.search;
  }

  for (const route of routes) {
    for (const path of route.paths) {
      const keys: Key[] = [];
      const re = pathToRegexp(path, keys, {end: true});
      const match = re.exec(pathname);
      if (match) {
        return formatRouteMatch(route, (typeof location !== 'string' && location.state) ?? {}, keys, match, search);
      }
    }
  }
};

// issue with passing AnyMatch into these https://stackoverflow.com/q/65727184/14809536
type MatchAnyRoute = Match<Route<any, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const matchSearch = <M extends MatchAnyRoute>(action: M, search?: queryString.OutputParams) => {
  const route = querystring.parse(
    action.route.getSearch ? action.route.getSearch(action.params) : ''
  );

  return querystring.stringify({
    ...search,
    ...route,
  });
};

export const matchPathname = <M extends MatchAnyRoute>(action: M) => action.route.getUrl(action.params);

export const matchUrl = <M extends MatchAnyRoute>(action: M) => {
  const path = matchPathname(action);
  const search = matchSearch(action);
  return `${path}${search ? `?${search}` : ''}`;
};

export const changeToLocation = curry((routes: AnyRoute[], dispatch: Dispatch, location: Location, action: Action) => {
  const match = findRouteMatch(routes, location);
  dispatch(actions.locationChange({location, match, action}));
});

export const routeHook = <R extends AnyRoute>(route: R, body: RouteHookBody<R>) =>
  actionHook(actions.locationChange, (stateHelpers) => {
    const boundHook = body(stateHelpers);

    return (action) => {
      if (locationChangeForRoute(route, action.payload)) {
        return boundHook(action.payload);
      }
    };
  });

/*
 * Recursively creates combinations of supplied replacements
 * for the base parameter in an url
 */
export const injectParamsToBaseUrl = (baseUrl: string, params: {[key: string]: string[]}): string[] => {
  const keyToInject = Object.keys(params)[0];
  if (!keyToInject) { return [baseUrl]; }

  return params[keyToInject].reduce((output, value) => {
    const injected = baseUrl.replace(`:${keyToInject}`, `:${value}`);
    return [...output, ...injectParamsToBaseUrl(injected, omit([keyToInject], params))];
  }, [] as string[]);
};

export const findPathForParams = (params: object, paths: string[]) => {
  const paramKeys = Object.keys(params);
  return paths.find((path) => {
    const paramsInPath = parse(path).filter((param) => pathTokenIsKey(param)) as Key[];
    return paramsInPath.length === paramKeys.length &&
      paramsInPath.every(({name}) => paramKeys.includes(name.toString()));
  });
};

export const getQueryForParam = (
  values: Record<string, string | string[] | null>,
  existingQuery?: string | OutputParams
) => {
  if (existingQuery) {
    const parsedExistingQuery = typeof existingQuery === 'string'
      ? queryString.parse(existingQuery)
      : existingQuery;

    return queryString.stringify({...parsedExistingQuery, ...values});
  }

  return queryString.stringify(values);
};

export const createNavigationOptions = (
  search: Record<string, string | null | undefined>,
  scrollTarget?: ScrollTarget
) => ({
  hash: scrollTarget ? `#${scrollTarget.elementId}` : undefined,
  search: queryString.stringify({
    ...omitBy(isNull, search),
    target: scrollTarget ? JSON.stringify(omit('elementId', scrollTarget)) : undefined,
  }),
});

export const navigationOptionsToString = (options: ReturnType<typeof createNavigationOptions>) =>
  (options.search ? `?${options.search}` : '') + (options.hash ? options.hash : '');
