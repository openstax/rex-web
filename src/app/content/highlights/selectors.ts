import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import {
  getHighlightColorFiltersWithContent,
  getHighlightLocationFilters,
  getHighlightLocationFiltersWithContent,
  getSortedSummaryHighlights
} from './utils';
import {
  checkIfHasMoreResults,
  filterCounts,
  getLoadedCountsPerSource,
  getSelectedHighlightsLocationFilters
} from './utils/selectorsUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.highlights
);

const currentPage = createSelector(
  localState,
  (state) => state.currentPage
)

export const highlightsLoaded = createSelector(
  currentPage,
  (page) => page.highlights !== null
);

export const highlightsPageId = createSelector(
  currentPage,
  (page) => page.pageId
);

export const highlights = createSelector(
  currentPage,
  (page) => page.highlights || []
);

const highlightsSummary = createSelector(
  localState,
  (state) => state.summary
)

export const totalCountsPerPage = createSelector(
  highlightsSummary,
  (summary) => summary.totalCountsPerPage
);

const totalCountsPerPageOrEmpty = createSelector(
  totalCountsPerPage,
  (totalCounts) => totalCounts || {}
);

export const focused = createSelector(
  currentPage,
  (page) => page.focused
);

export const hasUnsavedHighlight = createSelector(
  currentPage,
  (page) => page.hasUnsavedHighlight
);

export const myHighlightsOpen = createSelector(
  highlightsSummary,
  (summary) => summary.open
);

export const summaryIsLoading = createSelector(
  highlightsSummary,
  (summary) => summary.loading
);

export const summaryHighlights = createSelector(
  highlightsSummary,
  (summary) => summary.highlights
);

export const summaryPagination = createSelector(
  highlightsSummary,
  (summary) => summary.pagination
);

export const highlightLocationFilters = createSelector(
  parentSelectors.book,
  getHighlightLocationFilters
);

export const orderedSummaryHighlights = createSelector(
  summaryHighlights,
  highlightLocationFilters,
  (highlightsToSort, locationFilters) => {
    return getSortedSummaryHighlights(highlightsToSort, locationFilters);
  }
);

export const highlightLocationFiltersWithContent = createSelector(
  highlightLocationFilters,
  totalCountsPerPageOrEmpty,
  (locationFilters, totalCounts) => getHighlightLocationFiltersWithContent(locationFilters, totalCounts)
);

export const highlightColorFiltersWithContent = createSelector(
  totalCountsPerPageOrEmpty,
  (totalCounts) => getHighlightColorFiltersWithContent(totalCounts)
);

export const loadedCountsPerSource = createSelector(
  summaryHighlights,
  getLoadedCountsPerSource
);

const summaryFilters = createSelector(
  highlightsSummary,
  (summary) => summary.filters
);

const rawSummaryLocationFilters = createSelector(
  summaryFilters,
  (filters) => filters.locationIds
);

const rawSummaryColorFilters = createSelector(
  summaryFilters,
  (filters) => filters.colors
);

export const summaryLocationFilters = createSelector(
  rawSummaryLocationFilters,
  highlightLocationFiltersWithContent,
  (selectedLocations, withContent) =>
    new Set(selectedLocations.filter((locationId) => withContent.has(locationId)))
);

export const summaryColorFilters = createSelector(
  rawSummaryColorFilters,
  highlightColorFiltersWithContent,
  (selectedColors, withContent) =>
    new Set(selectedColors.filter((color) => withContent.has(color)))
);

const selectedHighlightLocationFilters = createSelector(
  highlightLocationFilters,
  summaryLocationFilters,
  getSelectedHighlightsLocationFilters
);

export const filteredCountsPerPage = createSelector(
  totalCountsPerPageOrEmpty,
  selectedHighlightLocationFilters,
  summaryColorFilters,
  filterCounts
);

export const hasMoreResults = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  summaryPagination,
  checkIfHasMoreResults
);
