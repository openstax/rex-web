import { applyMiddleware, compose, createStore, Middleware, Reducer, Store } from 'redux';
import { StateType } from 'typesafe-actions';
import { AnyAction } from '../app/types';

const DEBUG = process.env.ENVIRONMENT !== 'production';

interface Options<R extends Reducer> {
  reducer: R;
  middleware: Middleware[];
  initialState?: StateType<R>;
}

export default function<R extends Reducer>({middleware, reducer, initialState}: Options<R>): Store<StateType<R>, AnyAction> {
  const composeEnhancers = DEBUG && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

  const enhancer = composeEnhancers(applyMiddleware(...middleware));

  const store = createStore(reducer, initialState, enhancer);

  return store;
}
