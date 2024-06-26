import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { StoreEnhancer } from 'redux';
import analytics from '../helpers/analytics';
import createStore from '../helpers/createStore';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import Sentry from '../helpers/Sentry';
import * as appAactions from './actions';
import * as auth from './auth';
import * as content from './content';
import * as Services from './context/Services';
import * as developer from './developer';
import * as errors from './errors';
import ErrorBoundary from './errors/components/ErrorBoundary';
import OuterErrorBoundary from './errors/components/OuterErrorBoundary';
import * as featureFlags from './featureFlags';
import * as head from './head';
import MessageProvider from './messages/MessageProvider';
import * as navigation from './navigation';
import { AnyMatch } from './navigation/types';
import { matchPathname } from './navigation/utils';
import * as notifications from './notifications';
import createReducer from './reducer';
import { AppServices, AppState, Middleware } from './types';
import { createRouterService } from './navigation/routerService';

export const actions = {
  app: appAactions,
  auth: auth.actions,
  content: content.actions,
  errors: errors.actions,
  featureFlags: featureFlags.actions,
  head: head.actions,
  navigation: navigation.actions,
  notifications: notifications.actions,
};

export const routes = Object.values({
  ...(
    process.env.REACT_APP_ENV !== 'production'
      ? developer.routes
      : /* istanbul ignore next */ {} as typeof developer.routes
  ),
  ...content.routes,
  ...errors.routes,
});

const init = [
  ...Object.values(auth.init),
];

const hooks = [
  ...content.hooks,
  ...Object.values(head.hooks),
  ...Object.values(notifications.hooks),
  ...Object.values(auth.hooks),
];

const defaultServices = () => ({
  analytics,
  fontCollector: new FontCollector(),
  intl: {current: null},
  promiseCollector: new PromiseCollector(),
});

export interface AppOptions {
  initialState?: Partial<AppState>;
  initialEntries?: AnyMatch[];
  services:
    Pick<AppServices, Exclude<keyof AppServices, 'history' | 'router' | keyof ReturnType<typeof defaultServices>>>;
}

export default (options: AppOptions) => {
  const {initialEntries, initialState} = options;

  const createMemoryHistoryHelper = () => {
    const memoryHistory = createMemoryHistory(initialEntries && {
      initialEntries: initialEntries.map(matchPathname),
    });

    if (initialEntries && initialEntries[0]) {
      memoryHistory.location.state = initialEntries[0].state;
    }

    return memoryHistory;
  };

  const history = typeof window !== 'undefined' && window.history
    ? createBrowserHistory()
    : createMemoryHistoryHelper();

  const reducer = createReducer(history);

  const services: AppServices = {
    ...defaultServices(),
    ...options.services,
    router: createRouterService(routes),
    history,
  };

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
    ...hooks.map((hook) => hook(services)),
  ];

  const enhancers: StoreEnhancer[] = [];

  if (Sentry.shouldCollectErrors) {
    enhancers.push(Sentry.createReduxEnhancer());
  }

  const store = createStore({
    enhancers,
    initialState,
    middleware,
    reducer,
  });

  if (Sentry.shouldCollectErrors) {
    Sentry.initialize(store);
  }

  const container = () => (
    <Provider store={store}>
      <OuterErrorBoundary intl={services.intl.current}>
        <Services.Provider value={{ dispatch: store.dispatch, getState: store.getState, ...services }}>
          <MessageProvider>
            <ErrorBoundary>
              <navigation.components.NavigationProvider routes={routes} />
            </ErrorBoundary>
          </MessageProvider>
        </Services.Provider>
      </OuterErrorBoundary>
    </Provider>
  );

  navigation.utils.changeToLocation(routes, store.dispatch, history.location, 'POP');

  for (const initializer of init) {
    const promise = initializer({
      dispatch: store.dispatch,
      getState: store.getState,
      ...services,
    });

    services.promiseCollector.add(promise);
  }

  return {
    container,
    history,
    services,
    store,
  };
};
