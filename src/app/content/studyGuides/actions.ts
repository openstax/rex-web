import { createStandardAction } from 'typesafe-actions';
import { CountsPerSource, SummaryHighlights, SummaryHighlightsPagination } from '../types';

export const receiveStudyGuidesSummaryHighlights = createStandardAction(
  'Content/StudyGuides/Summary/receive'
)<SummaryHighlights, SummaryHighlightsPagination>();
export const openStudyGuides = createStandardAction('Content/StudyGuides/Summary/open')<void>();
export const closeStudyGuides = createStandardAction('Content/StudyGuides/Summary/close')<void>();
export const loadMoreStudyGuides = createStandardAction('Content/StudyGuides/loadMore')();
export const receiveStudyGuidesHighlights = createStandardAction(
  'Content/StudyGuides/receiveHighlights'
)<SummaryHighlights, SummaryHighlightsPagination>();
export const receiveHighlightsTotalCounts = createStandardAction(
  'Content/StudyGuides/receiveHighlightsTotalCounts'
)<CountsPerSource>();
