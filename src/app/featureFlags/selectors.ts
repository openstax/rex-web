import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const featureFlagsEnabled = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.featureFlags
);
