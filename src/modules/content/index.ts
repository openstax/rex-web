import {Reducer} from 'redux';
import pathToRegexp from 'path-to-regexp';
import {getType, createStandardAction} from 'typesafe-actions';
import * as navigation from '../navigation';

interface Params {
  bookId: string;
  pageId: string;
}

export const actions = {
  openToc: createStandardAction('Content/openToc')<void>(),
  closeToc: createStandardAction('Content/closeToc')<void>(),
};

export interface State {
  tocOpen: boolean;
  params?: Params,
};

const initialState = {
  tocOpen: true,
}

export const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.openToc):
      return {...state, tocOpen: true};
    case getType(actions.closeToc):
      return {...state, tocOpen: false};
    case getType(navigation.actions.locationChange):
      return navigation.matchForRoute('Content', action.payload.match)
        ? {...state, params: action.payload.match.params}
        : state;
    default:
      return state;
  };
};

const path = '/books/:bookId/pages/:pageId';

export const navigate = (params: Params): string => pathToRegexp.compile(path)(params);

export const routes: Route[] = [
  { name: 'Content', path, component: ({}) => null, }
];
