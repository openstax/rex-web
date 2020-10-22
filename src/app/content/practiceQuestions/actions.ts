import { createStandardAction } from 'typesafe-actions';
import { PracticeQuestionsSummary } from './types';

export const openPracticeQuestions = createStandardAction('Content/PracticeQuestions/open')<void>();
export const closePracticeQuestions = createStandardAction('Content/PracticeQuestions/close')<void>();

export const receivePracticeQuestionsSummary = createStandardAction(
  'Content/PracticeQuestions/Summary/receive'
)<PracticeQuestionsSummary>();
