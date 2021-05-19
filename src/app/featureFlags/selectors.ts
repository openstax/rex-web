import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const enabled = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.featureFlags
);
