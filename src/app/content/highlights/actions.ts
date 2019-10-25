import { createStandardAction } from 'typesafe-actions';
import { HighlightData } from './types';

export const focusHighlight = createStandardAction('Content/Highlight/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlight/clear')();
export const createHighlight = createStandardAction('Content/Highlight/create')<HighlightData>();
export const deleteHighlight = createStandardAction('Content/Highlight/delete')<string>();
export const updateHighlight = createStandardAction('Content/Highlight/update')<HighlightData>();
export const receiveHighlights = createStandardAction('Content/Highlight/receive')<HighlightData[]>();
