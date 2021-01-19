import { createStandardAction } from 'typesafe-actions';
import { LinkedArchiveTreeSection } from '../types';
import { PracticeQuestion, PracticeQuestionsSummary, SetPracticeAnswer } from './types';

export const setSelectedSection = createStandardAction(
  'Content/PracticeQuestions/setSelectedSection'
)<LinkedArchiveTreeSection | null>();
export const setQuestions = createStandardAction('Content/PracticeQuestions/setQuestions')<PracticeQuestion[]>();
export const nextQuestion = createStandardAction('Content/PracticeQuestions/nextQuestion')<void>();
export const setAnswer = createStandardAction('Content/PracticeQuestions/setAnswer')<SetPracticeAnswer>();
export const finishQuestions = createStandardAction('Content/PracticeQuestions/finishQuestions')<void>();

export const receivePracticeQuestionsSummary = createStandardAction(
  'Content/PracticeQuestions/Summary/receive'
)<PracticeQuestionsSummary>();
