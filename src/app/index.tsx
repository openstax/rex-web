import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import cs from 'react-intl/locale-data/cs';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import createStore from '../helpers/createStore';
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

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
    ...hooks,
  ];

  const store = createStore({
    middleware,
    reducer,
  });

  const language = (typeof window === 'undefined') ? 'en-us' : window.navigator.language;
  addLocaleData([...en, ...cs]);

  const messages = new Map()
  messages.set('en', { 'i18n:404': 'page not found' });
  messages.set('cs', { 'i18n:404': 'požadovaná stránka neexistuje'});

  function getMessages(language: string) {
      const lang = language.split('-')[0]
      return messages.get(lang) || messages.get('en')
  }

  const container = () => <Provider store={store}>
    <IntlProvider locale={language} messages={getMessages(language)}>
        <navigation.components.NavigationProvider routes={routes} />
    </IntlProvider>
  </Provider>;

  navigation.utils.init(routes, history.location, store.dispatch);

  return {
    container,
    history,
    store,
  };
};
