import { HighlightScrollTargetParams } from '../types';

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

export const hasHighlightScrollTargetParams = (
  object: { [key: string]: unknown }
): object is HighlightScrollTargetParams => {
  return object.type === 'highlight' && typeof object.id === 'string';
};
