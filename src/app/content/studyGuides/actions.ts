import { createStandardAction } from 'typesafe-actions';
import { StudyGuides } from './types';

export const receiveStudyGuides = createStandardAction('Content/StudyGuides/receive')<StudyGuides>();
