import { Location } from 'history';

export type State = Location;

export interface Match<Params> {
  route: Route<Params>;
  params: Params;
}

export type historyActions =
  {method: 'push', url: string} |
  {method: 'replace', url: string};

export type reducer = (state: State, action: AnyAction) => State;
