import { Storage } from '@openstax/types/lib.dom';
import merge from 'lodash/fp/merge';
import pick from 'lodash/fp/pick';
import { StoreEnhancer } from 'redux';
import config from '../config';

export default (paths: string[], storage: Storage): StoreEnhancer<{}, {}> => (next) => (reducer, preloadedState) => {
  const key = config.RELEASE_ID;
  const savedString = storage.getItem(key);
  const savedState = savedString && JSON.parse(savedString);

  const nextState = savedState || preloadedState
    ? merge(preloadedState, savedState)
    : undefined;

  const store = next(reducer, nextState);

  store.subscribe(() => {
    const state = store.getState();
    const subset = pick(paths, state);

    storage.setItem(key, JSON.stringify(subset));
  });

  return store;
};
