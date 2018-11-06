import {ActionType} from 'typesafe-actions';
import {Location} from 'history';
import {compose} from 'redux';
import {ComponentType} from 'react';
import {actions, AppState} from './app';

declare global {
  type AnyAction = ActionType<typeof actions>;

  type RootState = AppState;

  interface Route {
    name: string,
    paths: string[],
    getUrl: (input: any) => string, 
    component: ComponentType,
  }

  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose
  }
}


