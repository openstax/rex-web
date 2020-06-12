import { GetHighlightsColorsEnum, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { flow } from 'lodash';
import { createSelector } from 'reselect';
import { assertDefined } from '../../utils';
// Temporary import from /highlights directory until we make all this logic reusable and move it to content/
import { HighlightLocationFilters } from '../highlights/types';
import { getSortedSummaryHighlights } from '../highlights/utils';
import {
  filterCountsPerSourceByColorFilter,
  filterCountsPerSourceByLocationFilter
} from '../highlights/utils/paginationUtils';
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
    && summary.totalCountsPerPage
    && Object.keys(summary.totalCountsPerPage).length > 0
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
  studyGuidesSummary,
  (summary) => summary.pagination
);

export const hasMoreResults = createSelector(
  studyGuidesPagination,
  (pagination) => Boolean(pagination)
);

export const studyGuidesHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
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
  (selectedLocations) =>
    new Set(selectedLocations)
);

export const summaryColorFilters = createSelector(
  rawSummaryColorFilters,
  (selectedColors) =>
    new Set(selectedColors)
);

const selectedHighlightLocationFilters = createSelector(
  parentSelectors.highlightLocationFilters,
  summaryLocationFilters,
  (locationFilters, selectedIds) => [...selectedIds].reduce((result, selectedId) =>
    result.set(selectedId, assertDefined(locationFilters.get(selectedId), 'location filter id not found'))
  , new Map() as HighlightLocationFilters)
  );

export const filteredCountsPerPage = createSelector(
  totalCountsPerPage,
  selectedHighlightLocationFilters,
  summaryColorFilters,
  (totalCounts, locationFilters, colorFilters) => {
    return flow(
      (counts) => filterCountsPerSourceByLocationFilter(locationFilters, counts),
      (counts) => filterCountsPerSourceByColorFilter([...colorFilters], counts)
    )(totalCounts);
  }
);

export const orderedStudyGuidesHighlights = createSelector(
  studyGuidesHighlights,
  parentSelectors.highlightLocationFilters,
  getSortedSummaryHighlights
);
