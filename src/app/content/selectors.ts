import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.content
);

export const book = createSelector(
  localState,
  (state) => state.book
);

export const page = createSelector(
  localState,
  (state) => state.page
);

export const loading = createSelector(
  localState,
  (state) => state.loading
);

export const loadingBook = createSelector(
  loading,
  (ids) => ids.book
);

export const loadingPage = createSelector(
  loading,
  (ids) => ids.page
);
