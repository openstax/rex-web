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

export interface BasicMatch<R> {
  route: R;
}
export interface MatchWithParams<R extends AnyRoute> extends BasicMatch<R> {
  params: RouteParams<R>;
}
export interface MatchWithState<R extends AnyRoute> extends BasicMatch<R> {
  state?: RouteState<R>;
}

export type Match<R> = R extends AnyRoute
  ?
    (RouteParams<R> extends undefined
      ? BasicMatch<R>
      : MatchWithParams<R>)
    & (RouteState<R> extends undefined
      ? BasicMatch<R>
      : MatchWithState<R>)
  : never;

export type HistoryAction<R extends AnyRoute = AnyRoute> = Match<R> & {
  method: 'push' | 'replace';
  hash?: string;
  search?: string;
};

export type AnyHistoryAction = UnionHistoryActions<AnyRoute>;

export type reducer = (state: State, action: AnyAction) => State;

// @ts-ignore: 'S' is declared but its value is never read.
export interface Route<P, S = undefined> {
  name: string;
  paths: string[];
  // https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
  getUrl: (...args: [P] extends [undefined] ? []: [P]) => string;
  getSearch?: (...args: [P] extends [undefined] ? []: [P]) => string;
  component: ComponentType;
}

export interface LocationChange<M = AnyMatch> {
  location: Location;
  match?: M;
  action: Action;
}

export type AnyRoute = typeof routes[number];
export type AnyMatch = UnionRouteMatches<AnyRoute>;

export type MatchesWithParams<A = AnyMatch> =
  A extends any ? A extends {params: any} ? A : never : never;

export type RouteHookBody<R extends AnyRoute> = (helpers: MiddlewareAPI & AppServices) =>
  (locationChange: Required<LocationChange<Match<R>>>) =>
    Promise<any> | void;

export interface ScrollTarget {
  type: string;
  elementId: string;
  [key: string]: unknown;
}
