import { createSelector } from 'reselect';
// Temporary import from /highlights directory until we make all this logic reusable and move it to content/
import { HighlightLocationFilters } from '../highlights/types';
import { getHighlightLocationFilters, getSortedSummaryHighlights } from '../highlights/utils';
import * as parentSelectors from '../selectors';

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
  (summary) => summary.highlights !== null
    && summary.highlights.countsPerSource
    && Object.keys(summary.highlights.countsPerSource).length > 0
);

export const studyGuidesOpen = createSelector(
  localState,
  (state) => state.open
);

export const studyGuidesIsLoading = createSelector(
  localState,
  (state) => state.loading
);

// Temporary to make hasMoreResults works
export const studyGuidesPagination = createSelector(
  studyGuidesSummary,
  (summary) => summary.pagination
);

export const hasMoreResults = createSelector(
  studyGuidesPagination,
  (pagination) => Boolean(pagination)
);

export const studyGuidesHighlights = createSelector(
  localState,
  (state) => state.highlights
);

// Temporary until we make all this related logic reusable and move it to content/selectors.ts
export const highlightLocationFilters = createSelector(
  parentSelectors.book,
  (book) => book
    ? getHighlightLocationFilters(book)
    : new Map() as HighlightLocationFilters
);

export const orderedStudyGuidesHighlights = createSelector(
  studyGuidesHighlights,
  highlightLocationFilters,
  (highlightsToSort, locationFilters) => {
    return getSortedSummaryHighlights(highlightsToSort, locationFilters);
  }
);
