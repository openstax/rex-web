import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getPracticeQuestionsLocationFilters } from './utils';

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

const practiceQuestionsSummary = createSelector(
  localState,
  (state) => state.summary
);

export const hasPracticeQuestions = createSelector(
  practiceQuestionsSummary,
  (summary) => summary && Object.keys(summary).length > 0
);

export const practiceQuestionsLocationFilters = createSelector(
  practiceQuestionsSummary,
  parentSelectors.book,
  getPracticeQuestionsLocationFilters
);
