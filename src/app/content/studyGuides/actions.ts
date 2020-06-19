import { createStandardAction } from 'typesafe-actions';
import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination
} from '../highlights/types';

export const receiveSummaryStudyGuides = createStandardAction(
  'Content/StudyGuides/Summary/receive'
)<SummaryHighlights, SummaryHighlightsPagination>();
export const openStudyGuides = createStandardAction('Content/StudyGuides/Summary/open')<void>();
export const closeStudyGuides = createStandardAction('Content/StudyGuides/Summary/close')<void>();
export const loadMoreStudyGuides = createStandardAction('Content/StudyGuides/loadMore')();
export const receiveStudyGuidesTotalCounts = createStandardAction(
  'Content/StudyGuides/receiveTotalCounts'
)<CountsPerSource>();
