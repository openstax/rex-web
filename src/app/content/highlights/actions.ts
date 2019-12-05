import { NewHighlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';
import { HighlightData } from './types';

export const focusHighlight = createStandardAction('Content/Highlight/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlight/clear')();
export const createHighlight = createStandardAction('Content/Highlight/create')<
  Omit<NewHighlight, 'sourceType' | 'sourceId'> & {id: string}
>();
export const deleteHighlight = createStandardAction('Content/Highlight/delete')<string>();
export const updateHighlight = createStandardAction('Content/Highlight/update')<UpdateHighlightRequest>();
export const receiveHighlights = createStandardAction('Content/Highlight/receive')<HighlightData[]>();

export const openMyHighlights = createStandardAction('Content/openMyHighlights')<void>();
export const closeMyHighlights = createStandardAction('Content/closeMyHighlights')<void>();
