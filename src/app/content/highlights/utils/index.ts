import { HighlightScrollTarget } from '../types';

export { default as getHighlightLocationFilterForPage } from './getHighlightLocationFilterForPage';
export { default as getHighlightLocationFilters } from './getHighlightLocationFilters';
export { default as getHighlightLocationFiltersWithContent } from './getHighlightLocationFiltersWithContent';
export { default as getHighlightColorFiltersWithContent } from './getHighlightColorFiltersWithContent';

export {
  addToTotalCounts,
  updateInTotalCounts,
  removeFromTotalCounts,
  addSummaryHighlight,
  getHighlightByIdFromSummaryHighlights,
  removeSummaryHighlight,
  updateSummaryHighlight,
  updateSummaryHighlightsDependOnFilters,
  getSortedSummaryHighlights
} from './summaryHighlightsUtils';

export const getHighlightScrollTarget = (object: {[key: string]: any}, hash: string): HighlightScrollTarget | null => {
  if (hash && object.type === 'highlight' && typeof object.id === 'string') {
    return {
      elementId: hash.replace('#', ''),
      id: object.id,
      type: 'highlight',
    };
  }
  return null;
};
