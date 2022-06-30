import { HighlightColorEnum } from '@openstax/highlights-client';
import { flatten, unflatten } from 'flat';
import { Action, Location } from 'history';
import curry from 'lodash/fp/curry';
import isNull from 'lodash/fp/isNull';
import omit from 'lodash/fp/omit';
import omitBy from 'lodash/fp/omitBy';
import pathToRegexp, { Key, parse } from 'path-to-regexp';
import queryString, { OutputParams } from 'query-string';
import querystring from 'querystring';
import { Dispatch } from 'redux';
import { colorFilterQueryParameterName, locationIdsFilterQueryParameterName } from '../../content/constants';
import { SummaryFilters, SummaryFiltersUpdate } from '../../content/highlights/types';
import updateSummaryFilters from '../../content/highlights/utils/updateSummaryFilters';
import { colorfilterLabels } from '../../content/studyGuides/constants';
import { pathTokenIsKey } from '../../navigation/guards';
import * as navigation from '../../navigation/selectors';
import { AppState } from '../../types';
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
  !!match && match.route.name === route.name;

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

const formatRouteMatch = <R extends AnyRoute>(route: R, state: RouteState<R>, keys: Key[], match: RegExpExecArray) => ({
  params: getMatchParams(keys, match),
  route,
  state,
} as AnyMatch);

export const findRouteMatch = (routes: AnyRoute[], location: Location): AnyMatch | undefined => {
  for (const route of routes) {
    for (const path of route.paths) {
      const keys: Key[] = [];
      const re = pathToRegexp(path, keys, {end: true});
      const match = re.exec(location.pathname);
      if (match) {
        return formatRouteMatch(route, location.state || {}, keys, match);
      }
    }
  }
};

export const matchSearch = <M extends Match<Route<any, any>>>(action: M, search?: queryString.OutputParams) => {
  const route = querystring.parse(
    action.route.getSearch ? action.route.getSearch(action.params) : ''
  );

  return querystring.stringify({
    ...search,
    ...route,
  });
};

// issue with passing AnyMatch into this https://stackoverflow.com/q/65727184/14809536
export const matchPathname = <M extends Match<Route<any, any>>>(action: M) => action.route.getUrl(action.params);

// issue with passing AnyMatch into this https://stackoverflow.com/q/65727184/14809536
export const matchUrl = <M extends Match<Route<any, any>>>(action: M) => {
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
  values: Record<string, string | string[]>,
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

export const getFiltersFromQuery = (query: OutputParams) => {
  const queryColors = query[colorFilterQueryParameterName] as HighlightColorEnum | HighlightColorEnum[] | undefined;
  const queryLocationIds = query[locationIdsFilterQueryParameterName] as string | string[] | undefined;

  const colors = colorFilterQueryParameterName in query
    ? (Array.isArray(queryColors) ? queryColors : [queryColors])
      .filter((color) => color && colorfilterLabels.has(color)) as HighlightColorEnum[]
    : null;

  const locationIds = locationIdsFilterQueryParameterName in query
    ? (Array.isArray(queryLocationIds) ? queryLocationIds : [queryLocationIds]).filter((id) => id) as string[]
    : null;

  return { colors, locationIds };
};

export const updateQueryFromFilterChange = (
    dispatch: Dispatch, state: AppState, filters: SummaryFilters, change: SummaryFiltersUpdate
  ) => {
  const updatedFilters: {[key: string]: any} = updateSummaryFilters(filters, change);
  // convert empty filter arrys to null so they are preserved in query
  for (const filter in updatedFilters) {
    if (updatedFilters[filter] && !updatedFilters[filter].length) {
      updatedFilters[filter] = null;
    }
  }
  const match = navigation.match(state);
  const existingQuery = navigation.query(state);
  if (!match ) { return; }
  dispatch(actions.replace(match, {
    search: getQueryForParam(updatedFilters as any as Record<string, string[]>, existingQuery),
  }));
};
