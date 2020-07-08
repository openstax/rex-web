export { default as getHighlightLocationFilterForPage } from './getHighlightLocationFilterForPage';
export { default as getHighlightLocationFiltersWithContent } from './getHighlightLocationFiltersWithContent';
export { default as getHighlightColorFiltersWithContent } from './getHighlightColorFiltersWithContent';

export {
  getFilteredHighlightLocationFilters,
  getHighlightLocationFilters
} from './getHighlightLocationFilters';

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
