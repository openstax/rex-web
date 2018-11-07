import { Location } from 'history';

export type State = Location;

export interface Match {
  route: Route;
  params: any;
}

export type historyActions =
  {method: 'push', args: {url: string}} |
  {method: 'replace', args: {url: string}};

export type reducer = (state: State, action: AnyAction) => State;
