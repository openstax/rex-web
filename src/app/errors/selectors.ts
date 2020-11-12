import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.errors
);

export const getMessageIdStack = createSelector(
  localState,
  (state) => state.sentryMessageIdStack
);

export const code = createSelector(
  localState,
  (state) => state.code
);

export const showErrorDialog = createSelector(
  localState,
  (state) => state.showDialog
);
