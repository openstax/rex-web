import { GetHighlightsColorsEnum, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { createSelector } from 'reselect';
import { getSortedSummaryHighlights } from '../highlights/utils';
import * as parentSelectors from '../selectors';
import {
  filterCounts,
  getLoadedCountsPerSource,
  getSelectedHighlightsLocationFilters
} from '../utils/sharedHighlightsUtils/selectorsUtils';

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
  localState,
  (state) => state.highlights !== null && state.highlights.length > 0
);

export const studyGuidesOpen = createSelector(
  localState,
  (state) => state.summary.open
);

export const studyGuidesIsLoading = createSelector(
  localState,
  (state) => state.summary.loading
);

export const studyGuidesPagination = createSelector(
  studyGuidesSummary,
  (summary) => summary.pagination
);

export const hasMoreResults = createSelector(
  studyGuidesPagination,
  (pagination) => Boolean(pagination)
);

export const studyGuidesSummaryHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
);

export const loadedCountsPerSource = createSelector(
  studyGuidesSummaryHighlights,
  getLoadedCountsPerSource
);

const summaryFilters = createSelector(
  localState,
  (_state) => null
);

export const totalCountsPerPage = createSelector(
  localState,
  (state) => state.summary.totalCountsPerPage || {}
);

const rawSummaryLocationFilters = createSelector(
  parentSelectors.highlightLocationFilters,
  (locationFilters) =>  Array.from(locationFilters.keys())
);

const rawSummaryColorFilters = createSelector(
  summaryFilters,
  (_filters) => [
    GetHighlightsColorsEnum.Blue,
    GetHighlightsColorsEnum.Green,
    GetHighlightsColorsEnum.Pink,
    GetHighlightsColorsEnum.Purple,
    GetHighlightsColorsEnum.Yellow,
  ] as unknown as HighlightColorEnum[]
);

export const summaryLocationFilters = createSelector(
  rawSummaryLocationFilters,
  (selectedLocations) => new Set(selectedLocations)
);

export const summaryColorFilters = createSelector(
  rawSummaryColorFilters,
  (selectedColors) => new Set(selectedColors)
);

const selectedHighlightLocationFilters = createSelector(
  parentSelectors.highlightLocationFilters,
  summaryLocationFilters,
  getSelectedHighlightsLocationFilters
);

export const filteredCountsPerPage = createSelector(
  totalCountsPerPage,
  selectedHighlightLocationFilters,
  summaryColorFilters,
  filterCounts
);

export const orderedStudyGuidesHighlights = createSelector(
  studyGuidesSummaryHighlights,
  parentSelectors.highlightLocationFilters,
  getSortedSummaryHighlights
);
