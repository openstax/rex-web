export { default as getHighlightLocationFilters } from './getHighlightLocationFilters';
export { default as getHighlightLocationFiltersWithContent } from './getHighlightLocationFiltersWithContent';
export { default as getHighlightColorFiltersWithContent } from './getHighlightColorFiltersWithContent';
export { default as getHighlightLocationFilterForPage } from './getHighlightLocationFilterForPage';

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
