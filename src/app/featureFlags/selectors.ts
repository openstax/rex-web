import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.featureFlags
);

export const searchButtonStyle = createSelector(
  localState,
  (featureFlags) => featureFlags.searchButton || null
);
