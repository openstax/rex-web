import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getPracticeQuestionsLocationFilters, pageHasPracticeQuestions } from './utils';

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

export const selectedSection = createSelector(
  localState,
  (state) => state.selectedSection
);

export const questionsCount = createSelector(
  localState,
  (state) => state.questions.length
);

export const currentQuestionIndex = createSelector(
  localState,
  (state) => state.currentQuestionIndex
);

export const selectedSectionHasPracticeQuestions = createSelector(
  selectedSection,
  practiceQuestionsSummary,
  (section, summary) => Boolean(section && summary && pageHasPracticeQuestions(section.id, summary))
);

export const questionsAndAnswers = createSelector(
  localState,
  (state) => state.questionsAndAnswers
);

export const isFinalQuestion = createSelector(
  questionsCount,
  currentQuestionIndex,
  (count, index) => count - 1 === index
);
