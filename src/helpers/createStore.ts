import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Reducer,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
} from 'redux';
import { AnyAction, AppState, Store } from '../app/types';
import config from '../config';

interface Options {
  reducer: Reducer<AppState, AnyAction>;
  middleware: Middleware[];
  enhancers: StoreEnhancer[];
  initialState?: Partial<AppState>;
}

export default function({middleware, enhancers, reducer, initialState}: Options): Store {
  const composeEnhancers = (
    config.DEBUG
    && typeof window !== 'undefined'
    && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  )
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

  const _enhancers = [
    applyMiddleware(...middleware),
    ...enhancers,
  ];

  const _enhancer = composeEnhancers<StoreEnhancerStoreCreator<{}, {}>>(..._enhancers);
  const store = createStore(reducer, initialState, _enhancer);

  return store;
}
