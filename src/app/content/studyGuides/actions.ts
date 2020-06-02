import { HighlightsSummary } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';

export const receiveStudyGuides = createStandardAction('Content/StudyGuides/receive')<HighlightsSummary>();
export const openStudyGuides = createStandardAction('Content/StudyGuides/Summary/open')<void>();
export const closeStudyGuides = createStandardAction('Content/StudyGuides/Summary/close')<void>();
