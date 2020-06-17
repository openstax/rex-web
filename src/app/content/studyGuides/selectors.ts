import { createSelector } from 'reselect';
import { getHighlightLocationFilters, getSortedSummaryHighlights } from '../highlights/utils';
import {
  checkIfHasMoreResults,
  filterCounts,
  getLoadedCountsPerSource,
  getSelectedHighlightsLocationFilters,
} from '../highlights/utils/selectorsUtils';
import * as parentSelectors from '../selectors';
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

export const studyGuidesLocationFilters = createSelector(
  parentSelectors.book,
  getHighlightLocationFilters
);

export const summaryStudyGuides = createSelector(
  studyGuidesSummary,
  (summary) => summary.studyGuides
);

export const orderedSummaryStudyGuides = createSelector(
  summaryStudyGuides,
  studyGuidesLocationFilters,
  getSortedSummaryHighlights
);

export const loadedCountsPerSource = createSelector(
  summaryStudyGuides,
  getLoadedCountsPerSource
);

const rawSummaryLocationFilters = createSelector(
  studyGuidesLocationFilters,
  (locationFilters) =>  Array.from(locationFilters.keys())
);

export const summaryLocationFilters = createSelector(
  rawSummaryLocationFilters,
  (selectedLocations) => new Set(selectedLocations)
);

const selectedStudyGuidesLocationFilters = createSelector(
  studyGuidesLocationFilters,
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
