import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.search
);

export const query = createSelector(
  localState,
  (state) => state.query
);

export const results = createSelector(
  localState,
  (state) => state.results
);
