import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.experiments
);

// how to create selectors for particular variants
export const experimentsEnabled = createSelector(
  localState,
  (state) => state
);
