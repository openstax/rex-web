import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.highlights
);

export const isEnabled = createSelector(
  localState,
  (state) => !!state.enabled
);

export const highlights = createSelector(
  localState,
  (state) => state.highlights
);

export const focused = createSelector(
  localState,
  (state) => state.focused
);
