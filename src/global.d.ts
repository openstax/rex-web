/// <reference lib="es2017" />
/// <reference lib="es2017.object" />
import * as dom from '@openstax/types/lib.dom';
import { Location } from 'history';
import { ComponentType } from 'react';
import { compose } from 'redux';
import { ActionType } from 'typesafe-actions';
import { actions, AppState } from './app';

declare global {
  type AnyAction = ActionType<typeof actions>;

  type RootState = AppState;

  interface Route {
    name: string;
    paths: string[];
    getUrl: (input: any) => string;
    component: ComponentType;
  }

  interface Window extends dom.Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
  }

  var window: Window | undefined;
  var document: dom.Document | undefined;
}
