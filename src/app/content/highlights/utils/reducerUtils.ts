import { State } from '../types';
import { getHighlightByIdFromSummaryHighlights } from './summaryHighlightsUtils';

export const findHighlight = (state: State, id: string) => {
  return (state.currentPage.highlights || []).find((highlight) => highlight.id === id)
    || getHighlightByIdFromSummaryHighlights(state.summary.highlights || {}, id);
};
