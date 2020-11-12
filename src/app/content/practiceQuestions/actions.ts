import { createStandardAction } from 'typesafe-actions';
import { LinkedArchiveTreeSection } from '../types';
import { PracticeQuestion, PracticeQuestionsSummary } from './types';

export const openPracticeQuestions = createStandardAction('Content/PracticeQuestions/open')<void>();
export const closePracticeQuestions = createStandardAction('Content/PracticeQuestions/close')<void>();

export const setSelectedSection = createStandardAction(
  'Content/PracticeQuestions/setSelectedSection'
)<LinkedArchiveTreeSection | null>();
export const setQuestions = createStandardAction('Content/PracticeQuestions/setQuestions')<PracticeQuestion[]>();
export const nextQuestion = createStandardAction('Content/PracticeQuestions/nextQuestion')<void>();

export const receivePracticeQuestionsSummary = createStandardAction(
  'Content/PracticeQuestions/Summary/receive'
)<PracticeQuestionsSummary>();
