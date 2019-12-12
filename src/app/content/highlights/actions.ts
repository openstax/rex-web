import { NewHighlight, UpdateHighlightRequest, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';
import { HighlightData, SummaryHighlights } from './types';

export const focusHighlight = createStandardAction('Content/Highlight/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlight/clear')();
export const createHighlight = createStandardAction('Content/Highlight/create')<NewHighlight & {id: string}>();
export const deleteHighlight = createStandardAction('Content/Highlight/delete')<string>();
export const updateHighlight = createStandardAction('Content/Highlight/update')<UpdateHighlightRequest>();
export const receiveHighlights = createStandardAction('Content/Highlight/receive')<HighlightData[]>();

export const openMyHighlights = createStandardAction('Content/openMyHighlights')<void>();
export const closeMyHighlights = createStandardAction('Content/closeMyHighlights')<void>();

export const setColorsFilter = createStandardAction('Content/setColorsFilter')<HighlightColorEnum[]>();
export const setChaptersFilter = createStandardAction('Content/setChaptersFilter')<string[]>();
export const filtersChange = createStandardAction('Content/filtersChange')<void>();
export const setIsLoadingSummary = createStandardAction('Content/setIsLoadingSummary')<boolean>();
export const receiveSummaryHighlights = createStandardAction('Content/receiveSummaryHighlights')<SummaryHighlights>();
