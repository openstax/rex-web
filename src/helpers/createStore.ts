import {StateType} from 'typesafe-actions';
import {createStore, Store, applyMiddleware, compose, Middleware, Reducer} from 'redux';

const DEBUG = process.env.ENVIRONMENT !== 'production';

interface Options<R extends Reducer> {
  reducer: R;
  middleware: Middleware[];
  initialState?: StateType<R>;
}

export default function<R extends Reducer>({middleware, reducer, initialState}: Options<R>): Store<StateType<R>, AnyAction> {
  const composeEnhancers = DEBUG && window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

  const enhancer = composeEnhancers(applyMiddleware(...middleware));

  const store = createStore(reducer, initialState, enhancer);

  return store;
}
