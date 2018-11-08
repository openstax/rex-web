import { ActionType } from 'typesafe-actions';
import { actions, routes } from '.';
import { State as contentState } from './content/types';
import { State as errorsState } from './errors/types';
import { State as navigationState } from './navigation/types';

export interface AppState {
  content: contentState;
  errors: errorsState;
  navigation: navigationState;
}

export type AnyRoute = typeof routes[number];
export type AnyAction = ActionType<typeof actions>;
