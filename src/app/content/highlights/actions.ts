import { NewHighlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';
import { HighlightData, SummaryFilters, SummaryHighlights } from './types';

export const focusHighlight = createStandardAction('Content/Highlight/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlight/clear')();
export const createHighlight = createStandardAction('Content/Highlight/create')<NewHighlight & {id: string}, {
  chapterId: string,
  pageId: string,
}>();
export const deleteHighlight = createStandardAction('Content/Highlight/delete')<string, {
  chapterId: string,
  pageId: string,
}>();
export const updateHighlight = createStandardAction('Content/Highlight/update')<UpdateHighlightRequest, {
  chapterId: string,
  pageId: string,
}>();
export const receiveHighlights = createStandardAction('Content/Highlight/receive')<HighlightData[]>();

export const openMyHighlights = createStandardAction('Content/openMyHighlights')<void>();
export const closeMyHighlights = createStandardAction('Content/closeMyHighlights')<void>();

export const setSummaryFilters = createStandardAction('Content/setColorsFilter')<SummaryFilters>();
export const receiveSummaryHighlights = createStandardAction('Content/receiveSummaryHighlights')<SummaryHighlights>();
export const addCurrentPageToSummaryFilters = createStandardAction('Content/addCurrentPageToSummaryFilters')<void>();
