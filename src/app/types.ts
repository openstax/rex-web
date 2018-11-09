import { Dispatch as ReduxDispatch, Middleware as ReduxMiddleware } from 'redux';
import { ActionType } from 'typesafe-actions';
import { actions } from '.';
import { State as contentState } from './content/types';
import { State as errorsState } from './errors/types';
import { State as navigationState } from './navigation/types';

export interface AppState {
  content: contentState;
  errors: errorsState;
  navigation: navigationState;
}

// TODO - make this a real union
export type AnyActionCreator = (...args: any[]) => AnyAction;
export type AnyAction = ActionType<typeof actions>;

export type Dispatch = ReduxDispatch<AnyAction>;
export type Middleware = ReduxMiddleware<{}, AppState, Dispatch>;
