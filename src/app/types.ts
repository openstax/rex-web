import {
  Dispatch as ReduxDispatch,
  Middleware as ReduxMiddleware,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
} from 'redux';
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

// bound redux stuff
export type Dispatch = ReduxDispatch<AnyAction>;
export type Middleware = ReduxMiddleware<{}, AppState, Dispatch>;
export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, AppState>;
export type Store = ReduxStore<AppState, AnyAction>;
