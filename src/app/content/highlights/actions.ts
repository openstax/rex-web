import { SerializedHighlight } from '@openstax/highlighter';
import { createStandardAction } from 'typesafe-actions';

export const focusHighlight = createStandardAction('Content/Highlight/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlight/clear')();
export const createHighlight = createStandardAction('Content/Highlight/create')<SerializedHighlight['data']>();
export const deleteHighlight = createStandardAction('Content/Highlight/delete')<string>();
export const updateHighlight = createStandardAction('Content/Highlight/update')<SerializedHighlight['data']>();
export const receiveHighlights = createStandardAction('Content/Highlight/receive')<
  Array<SerializedHighlight['data']>
>();
