import { SerializedHighlight } from '@openstax/highlighter';
import { createStandardAction } from 'typesafe-actions';

export const createHighlight = createStandardAction('Content/Highlight/create')<SerializedHighlight['data']>();
export const deleteHighlight = createStandardAction('Content/Highlight/delete')<string>();
