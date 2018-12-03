import { Location } from 'history';
import { ComponentType } from 'react';
import { routes } from '../';
import { AnyAction } from '../types';

export type State = Location;

type RouteParams<R> = R extends Route<infer P> ? P : never;
type RouteState<R> = R extends Route<any, infer S> ? S : never;

type UnionRouteMatches<R> = R extends AnyRoute ? Match<R> : never;
type UnionHistoryActions<R> = R extends AnyRoute ? HistoryAction<R> : never;

interface MatchWithoutParams<R extends AnyRoute> {
  route: R;
}
export interface MatchWithParams<R extends AnyRoute> extends MatchWithoutParams<R> {
  params: RouteParams<R>;
}
export interface MatchWithState<R extends AnyRoute> extends MatchWithoutParams<R> {
  state?: RouteState<R>;
}

export type GenericMatch = MatchWithParams<AnyRoute> | MatchWithoutParams<AnyRoute>;

export type Match<R extends AnyRoute> =
  (RouteParams<R> extends undefined
    ? MatchWithoutParams<R> | MatchWithParams<R>
    : MatchWithParams<R>)
& (RouteState<R> extends undefined
    ? {}
    : MatchWithState<R>);

export type HistoryAction<R extends AnyRoute> = Match<R> & {
  method: 'push' | 'replace';
};

export type AnyHistoryAction = UnionHistoryActions<AnyRoute>;

export type reducer = (state: State, action: AnyAction) => State;

// @ts-ignore: 'S' is declared but its value is never read.
export interface Route<P, S = undefined> {
  name: string;
  paths: string[];
  getUrl: (...args: P extends undefined ? []: [P]) => string;
  component: ComponentType;
}

export interface LocationChange {
  location: Location;
  match?: AnyMatch;
}

export type AnyRoute = typeof routes[number];
export type AnyMatch = UnionRouteMatches<AnyRoute>;
