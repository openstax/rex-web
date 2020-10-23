import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.practiceQuestions
);

export const practiceQuestionsEnabled = createSelector(
  localState,
  (state) => state.isEnabled
);

export const practiceQuestionsOpen = createSelector(
  localState,
  (state) => state.open
);
