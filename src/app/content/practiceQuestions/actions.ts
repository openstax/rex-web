import { createStandardAction } from 'typesafe-actions';
import { PracticeQuestionsSummary } from './types';

export const receivePracticeQuestionsSummary = createStandardAction(
  'Content/PracticeQuestions/Summary/receive'
)<PracticeQuestionsSummary>();
