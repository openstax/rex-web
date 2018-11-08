import { Location } from 'history';
import { ComponentType } from 'react';
import { AnyAction } from '../types';

export type State = Location;

export interface Match<Params> {
  route: Route<Params>;
  params: Params;
}

export type historyActions =
  {method: 'push', url: string} |
  {method: 'replace', url: string};

export type reducer = (state: State, action: AnyAction) => State;

export interface Route<Params> {
  name: string;
  paths: string[];
  getUrl: (...args: Params extends undefined ? []: [Params]) => string;
  component: ComponentType;
}
