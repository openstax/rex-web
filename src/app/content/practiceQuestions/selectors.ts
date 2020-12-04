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

export const question = createSelector(
  localState,
  currentQuestionIndex,
  (state, index) => index === null ? undefined : state.questions[index]
);

export const selectedSectionHasPracticeQuestions = createSelector(
  selectedSection,
  practiceQuestionsSummary,
  (section, summary) => Boolean(section && summary && pageHasPracticeQuestions(section.id, summary))
);

export const questionAnswers = createSelector(
  localState,
  (state) => new Map(Object.entries(state.questionAnswers))
);

export const isCurrentQuestionSubmitted = createSelector(
  questionAnswers,
  question,
  (answers, currentQuestion) => Boolean(currentQuestion && answers.has(currentQuestion.uid))
);

export const isFinalQuestion = createSelector(
  questionsCount,
  currentQuestionIndex,
  (count, index) => count - 1 === index
);

export const questionsInProggress = createSelector(
  currentQuestionIndex,
  (index) => index !== null
);
