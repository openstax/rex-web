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

export const studyGuidesSummary = createSelector(
  localState,
  (state) => state.summary
);

export const hasStudyGuides = createSelector(
  studyGuidesSummary,
  (summary) => summary.totalCountsPerPage
    && Object.keys(summary.totalCountsPerPage).length > 0
);

export const totalCountsPerPageOrEmpty = createSelector(
  studyGuidesSummary,
  (summary) => summary.totalCountsPerPage || {}
);

export const studyGuidesOpen = createSelector(
  studyGuidesSummary,
  (summary) => summary.open
);

export const summaryIsLoading = createSelector(
  studyGuidesSummary,
  (summary) => summary.loading
);

export const summaryStudyGuidesPagination = createSelector(
  studyGuidesSummary,
  (summary) => summary.pagination
);

export const summaryStudyGuidesHighlights = createSelector(
  studyGuidesSummary,
  (summary) => summary.highlights
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

const selectedStudyGuidesLocationFilters = createSelector(
  parentSelectors.highlightLocationFilters,
  summaryLocationFilters,
  getSelectedHighlightsLocationFilters
);

export const filteredCountsPerPage = createSelector(
  totalCountsPerPageOrEmpty,
  selectedStudyGuidesLocationFilters,
  (counts, locationFilers) => filterCounts(counts, locationFilers, new Set(allColors))
);

export const hasMoreResults = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  summaryStudyGuidesPagination,
  checkIfHasMoreResults
);
