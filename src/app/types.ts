import {
  Dispatch as ReduxDispatch,
  Middleware as ReduxMiddleware,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
} from 'redux';
import { ActionType } from 'typesafe-actions';
import { actions } from '.';
import createArchiveLoader from '../helpers/createArchiveLoader';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import { State as contentState } from './content/types';
import { State as errorsState } from './errors/types';
import { State as headState } from './head/types';
import { State as navigationState } from './navigation/types';

export interface AppState {
  content: contentState;
  errors: errorsState;
  head: headState;
  navigation: navigationState;
}

export interface AppServices {
  promiseCollector: PromiseCollector;
  fontCollector: FontCollector;
  archiveLoader: ReturnType<typeof createArchiveLoader>;
}

type ActionCreator<T extends string = string> = (...args: any[]) => { type: T };
type ActionCreatorMap<T> = { [K in keyof T]: FlattenedActionMap<T[K]> };

type FlattenedActionMap<ActionCreatorOrMap> = ActionCreatorOrMap extends ActionCreator
  ? ActionCreatorOrMap
  : ActionCreatorOrMap extends object
    ? ActionCreatorMap<ActionCreatorOrMap>[keyof ActionCreatorOrMap]
    : never;

export type AnyActionCreator = FlattenedActionMap<typeof actions>;
export type AnyAction = ActionType<typeof actions>;

// bound redux stuff
export type Dispatch = ReduxDispatch<AnyAction>;
export type Middleware = ReduxMiddleware<{}, AppState, Dispatch>;
export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, AppState>;
export type Store = ReduxStore<AppState, AnyAction>;

export type ActionHookBody<C extends AnyActionCreator> = (helpers: MiddlewareAPI & AppServices) =>
  (action: ReturnType<C>) => Promise<any> | void;
