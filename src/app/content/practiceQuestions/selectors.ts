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

export const hasPracticeQuestions = createSelector(
  localState,
  (state) => state.summary && Object.keys(state.summary).length > 0
);

const practiceQuestionsSummary = createSelector(
  localState,
  (state) => state.summary,
);

export const practiceQuestionsLocationFilters = createSelector(
  practiceQuestionsSummary,
  parentSelectors.book,
  getPracticeQuestionsLocationFilters
);
