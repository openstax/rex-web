import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getScrollTargetFromQuery } from './utils';

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

export const scrollTargetParams = createSelector(
  localState,
  (state) => getScrollTargetFromQuery(state.query)
);

export const location = localState;
