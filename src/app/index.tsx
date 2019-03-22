import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import createStore from '../helpers/createStore';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import * as content from './content';
import * as Services from './context/Services';
import * as developer from './developer';
import * as errors from './errors';
import * as head from './head';
import MessageProvider from './MessageProvider';
import * as navigation from './navigation';
import { hasState } from './navigation/guards';
import { AnyMatch } from './navigation/types';
import { matchUrl } from './navigation/utils';
import * as notifications from './notifications';
import { AnyAction, AppServices, AppState, Middleware } from './types';

export const actions = {
  content: content.actions,
  errors: errors.actions,
  head: head.actions,
  navigation: navigation.actions,
  notifications: notifications.actions,
};

export const routes = [
  ...(
    process.env.REACT_APP_ENV !== 'production'
      ? Object.values(developer.routes)
      : /* istanbul ignore next */ []
  ),
  ...Object.values(content.routes),
  ...Object.values(errors.routes),
];

const hooks = [
  ...Object.values(content.hooks),
  ...Object.values(head.hooks),
];

const defaultServices = () => ({
  fontCollector: new FontCollector(),
  promiseCollector: new PromiseCollector(),
});

interface Options {
  initialState?: Partial<AppState>;
  initialEntries?: AnyMatch[];
  services: Pick<AppServices, Exclude<keyof AppServices, keyof ReturnType<typeof defaultServices>>>;
}

export default (options: Options) => {
  const {initialEntries, initialState} = options;

  const history = typeof window !== 'undefined' && window.history
    ? createBrowserHistory()
    : createMemoryHistory(initialEntries && {
      initialEntries: initialEntries.map(matchUrl),
    });

  if (initialEntries && initialEntries.length > 0) {
    const entry = initialEntries[initialEntries.length - 1];
    if (hasState(entry)) {
      history.location.state = entry.state;
    }
  }

  const reducer = combineReducers<AppState, AnyAction>({
    content: content.reducer,
    errors: errors.reducer,
    head: head.reducer,
    navigation: navigation.createReducer(history.location),
    notifications: notifications.reducer,
  });

  const services = {
    ...defaultServices(),
    ...options.services,
  };

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
    ...hooks.map((hook) => hook(services)),
  ];

  const store = createStore({
    initialState,
    middleware,
    reducer,
  });

  const container = () => <Provider store={store}>
    <MessageProvider>
      <Services.Provider value={services} >
        <navigation.components.NavigationProvider routes={routes} />
      </Services.Provider>
    </MessageProvider>
  </Provider>;

  if (!initialState || !initialState.navigation) {
    navigation.utils.changeToLocation(routes, store.dispatch, history.location);
  }

  // the default font
  services.fontCollector.add('/styles/fonts.css');

  return {
    container,
    history,
    services,
    store,
  };
};
