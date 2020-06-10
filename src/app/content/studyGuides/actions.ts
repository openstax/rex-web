import { HighlightsSummary } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';
import { StudyGuidesHighlights, SummaryHighlightsPagination } from './types';

export const receiveStudyGuides = createStandardAction(
  'Content/StudyGuides/receive'
)<HighlightsSummary, SummaryHighlightsPagination>();
export const openStudyGuides = createStandardAction('Content/StudyGuides/Summary/open')<void>();
export const closeStudyGuides = createStandardAction('Content/StudyGuides/Summary/close')<void>();
export const loadMoreStudyGuides = createStandardAction('Content/StudyGuides/loadMore')();
export const receiveStudyGuidesHighlights = createStandardAction(
  'Content/StudyGuides/receiveHighlights'
)<StudyGuidesHighlights>();
