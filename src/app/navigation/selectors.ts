import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getTargetFromQuery } from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.navigation
);

export const locationState = createSelector(
  localState,
  (state) => state.state
);

export const pathname = createSelector(
  localState,
  (state) => state.pathname
);

export const hash = createSelector(
  localState,
  (state) => state.hash
);

export const target = createSelector(
  localState,
  (state) => getTargetFromQuery(state.query)
);

export const location = localState;
