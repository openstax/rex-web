import { Action, Location } from 'history';
import { OutputParams } from 'query-string';
import { ComponentType } from 'react';
import { routes } from '../';
import { AnyAction, AppServices, MiddlewareAPI } from '../types';

export type State = Location & {
  match?: AnyMatch;
  query: OutputParams;
};

export type RouteParams<R> = R extends Route<infer P> ? P : never;
export type RouteState<R> = R extends Route<any, infer S> ? S : never;

type UnionRouteMatches<R> = R extends AnyRoute ? Match<R> : never;
type UnionHistoryActions<R> = R extends AnyRoute ? HistoryAction<R> : never;

export type Match<R> = R extends Route<infer P, infer S>
  ? {
    route: R,
    params: P,
    state: S,
  }
  : never;

export type HistoryAction<R extends AnyRoute = AnyRoute> = Match<R> & {
  method: 'push' | 'replace';
  hash?: string;
  search?: string;
};

export type AnyHistoryAction = UnionHistoryActions<AnyRoute>;

export type reducer = (state: State, action: AnyAction) => State;

export interface RouteParamsType {
  [key: string]: string | RouteParamsType;
}
export interface RouteStateType {
  [key: string]: any;
}

export interface Route<
  P extends RouteParamsType = {},
  // @ts-ignore: 'S' is declared but its value is never read.
  S extends RouteStateType = {}
> {
  name: string;
  paths: string[];
  getUrl: (p: P) => string;
  getSearch?: (p: P) => string;
  component: ComponentType;
  // https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
  // getUrl: [P] extends [undefined] ? (() => string): ((p: P) => string);
  // getSearch?: [P] extends [undefined] ? (() => string): ((p: P) => string);
  // getUrl: [P] extends [undefined] ? (() => string): ((p: P) => string);
  // getSearch?: [P] extends [undefined] ? (() => string): ((p: P) => string);
}

export interface LocationChange<M = AnyMatch> {
  location: Location;
  match?: M;
  action: Action;
}

export type AnyRoute = typeof routes[number];
export type AnyMatch = UnionRouteMatches<AnyRoute>;

/*
 * these must be generic because the AnyRoute getUrl types with specific params don't technically
 * extend the getUrl with the base structural type
 *
 * these need to be crazy unions because of the conditional types within the match and route
export type GenericMatchWithParams<P extends RouteParamsType, S extends RouteStateType | undefined> =
  Match<Route<P, Exclude<S, undefined>>> | Match<Route<P, undefined>>;

export type GenericMatch2 =
  Match<Route<RouteParamsType, RouteStateType>>
  | Match<Route<RouteParamsType, undefined>>
  | Match<Route<undefined, RouteStateType>>
  | Match<Route<undefined, undefined>>;

export type GenericMatch<P extends RouteParamsType | undefined, S extends RouteStateType | undefined> =
  Match<Route<Exclude<P, undefined>, Exclude<S, undefined>>>
  | Match<Route<Exclude<P, undefined>, undefined>>
  | Match<Route<undefined, Exclude<S, undefined>>>
  | Match<Route<undefined, S>>
  | Match<Route<undefined, S>>;
 */

export type RouteHookBody<R extends AnyRoute> = (helpers: MiddlewareAPI & AppServices) =>
  (locationChange: Required<LocationChange<Match<R>>>) =>
    Promise<any> | void;

export interface ScrollTarget {
  type: string;
  elementId: string;
  [key: string]: unknown;
}
