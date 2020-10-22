import { createStandardAction } from 'typesafe-actions';

export const openPracticeQuestions = createStandardAction('Content/PracticeQuestions/open')<void>();
export const closePracticeQuestions = createStandardAction('Content/PracticeQuestions/close')<void>();
