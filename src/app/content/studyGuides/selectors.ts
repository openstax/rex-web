import { createSelector } from 'reselect';
import { getSortedSummaryHighlights } from '../highlights/utils';
import * as parentSelectors from '../selectors';
import {
  checkIfHasMoreResults,
  filterCounts,
  getLoadedCountsPerSource,
  getSelectedHighlightsLocationFilters,
} from '../utils/selectorsUtils';
import { allColors } from './constants';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.studyGuides
);

export const studyGuidesEnabled = createSelector(
  localState,
  (state) => state.isEnabled
);

export const hasStudyGuides = createSelector(
  localState,
  (state) => state.highlights !== null && state.highlights.length > 0
);

export const totalCountsPerPageOrEmpty = createSelector(
  localState,
  (state) => state.summary.totalCountsPerPage || {}
);

export const studyGuidesOpen = createSelector(
  localState,
  (state) => state.summary.open
);

export const summaryIsLoading = createSelector(
  localState,
  (state) => state.summary.loading
);

export const studyGuidesSummary = createSelector(
  localState,
  (state) => state.summary
);

export const studyGuidesPagination = createSelector(
  studyGuidesSummary,
  (summary) => summary.pagination
);

export const summaryStudyGuidesHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
);

export const orderedSummaryStudyGuidesHighlights = createSelector(
  summaryStudyGuidesHighlights,
  parentSelectors.highlightLocationFilters,
  getSortedSummaryHighlights
);

export const loadedCountsPerSource = createSelector(
  summaryStudyGuidesHighlights,
  getLoadedCountsPerSource
);

const rawSummaryLocationFilters = createSelector(
  parentSelectors.highlightLocationFilters,
  (locationFilters) =>  Array.from(locationFilters.keys())
);

export const summaryLocationFilters = createSelector(
  rawSummaryLocationFilters,
  (selectedLocations) => new Set(selectedLocations)
);

const selectedHighlightLocationFilters = createSelector(
  parentSelectors.highlightLocationFilters,
  summaryLocationFilters,
  getSelectedHighlightsLocationFilters
);

export const filteredCountsPerPage = createSelector(
  totalCountsPerPageOrEmpty,
  selectedHighlightLocationFilters,
  (counts, locationFilers) => filterCounts(counts, locationFilers, new Set(allColors))
);

export const hasMoreResults = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  studyGuidesPagination,
  checkIfHasMoreResults
);
