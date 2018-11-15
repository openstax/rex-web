import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import createStore from '../helpers/createStore';
import { PromiseCollector } from '../helpers/PromiseCollector';
import * as content from './content';
import * as errors from './errors';
import * as navigation from './navigation';
import { AnyAction, AppState, Middleware } from './types';

export const actions = {
  content: content.actions,
  errors: errors.actions,
  navigation: navigation.actions,
};

export const routes = [
  ...Object.values(content.routes),
  ...Object.values(errors.routes),
];

const hooks = [
  ...Object.values(content.hooks),
];

interface Options {
  initialState?: AppState;
  initialEntries?: any;
}

export default (options: Options = {}) => {
  const history = typeof window !== 'undefined' && window.history
    ? createBrowserHistory()
    : createMemoryHistory({initialEntries: options.initialEntries});

  const reducer = combineReducers<AppState, AnyAction>({
    content: content.reducer,
    errors: errors.reducer,
    navigation: navigation.createReducer(history.location),
  });

  const hookWatcher = new PromiseCollector();

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
    ...hooks.map((hook) => hook(hookWatcher)),
  ];

  const store = createStore({
    middleware,
    reducer,
  });

  const container = () => <Provider store={store}>
    <navigation.components.NavigationProvider routes={routes} />
  </Provider>;

  navigation.utils.init(routes, history.location, store.dispatch);

  return {
    container,
    history,
    hooks: hookWatcher,
    store,
  };
};
