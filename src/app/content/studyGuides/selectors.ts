import { createSelector } from 'reselect';
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

export const studyGuidesSummaryIsNotEmpty = createSelector(
  studyGuidesSummary,
  (summary) => summary !== null
    && summary.countsPerSource
    && Object.keys(summary.countsPerSource).length > 0
);

export const studyGuidesOpen = createSelector(
  localState,
  (state) => state.open
);

export const studyGuidesIsLoading = createSelector(
  localState,
  (state) => state.loading
);

export const studyGuidesPagination = createSelector(
  localState,
  (state) => state.pagination
);

export const totalCountsPerPage = createSelector(
  localState,
  (state) => state.totalCountsPerPage
);

export const hasMoreResults = createSelector(
  studyGuidesPagination,
  (pagination) => Boolean(pagination)
);

export const studyGuidesHighlights = createSelector(
  localState,
  (state) => state.highlights
);

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
