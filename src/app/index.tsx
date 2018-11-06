import {createBrowserHistory, createMemoryHistory} from 'history';
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, Middleware} from 'redux';
import createStore from '../helpers/createStore';
import * as content from './content';
import * as errors from './errors';
import * as navigation from './navigation';

export const actions = {
  content: content.actions,
  errors: errors.actions,
  navigation: navigation.actions,
};

export interface AppState {
  content: content.types.State;
  errors: errors.types.State;
  navigation: navigation.types.State;
}

interface Options {
  initialState?: AppState;
  initialEntries?: any;
}

export default (options: Options = {}) => {
  const history = window && window.history
    ? createBrowserHistory()
    : createMemoryHistory({initialEntries: options.initialEntries});

  const reducer = combineReducers<AppState, AnyAction>({
    content: content.reducer,
    errors: errors.reducer,
    navigation: navigation.createReducer(history.location),
  });

  const routes = [
    ...Object.values(content.routes),
    ...Object.values(errors.routes),
  ];

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
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
    store,
  };
};
