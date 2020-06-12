import { GetHighlightsColorsEnum, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { flow } from 'lodash';
import { createSelector } from 'reselect';
// Temporary import from /highlights directory until we make all this logic reusable and move it to content/
import { HighlightLocationFilters } from '../highlights/types';
import { getHighlightLocationFilters, getSortedSummaryHighlights } from '../highlights/utils';
import { filterCountsPerSourceByColorFilter, filterCountsPerSourceByLocationFilter } from '../highlights/utils/paginationUtils';
import * as parentSelectors from '../selectors';
import { findArchiveTreeNode } from '../utils/archiveTreeUtils';
import { assertDefined } from '../../utils';
import { stripIdVersion } from '../utils/idUtils';

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

// Temporary until we make all this related logic reusable and move it to content/selectors.ts
export const highlightLocationFilters = createSelector(
  parentSelectors.book,
  (book) => book
    ? getHighlightLocationFilters(book)
    : new Map() as HighlightLocationFilters
);

const rawSummaryLocationFilters = createSelector(
  parentSelectors.book,
  summaryFilters,
  (book, _filters) => [
    '00a2d5b6-9b1d-49ab-a40d-fcd30ceef643',
    '2c60e072-7665-49b9-a2c9-2736b72b533c',
    '5e1ff6e7-0980-4ae0-bc8a-4b591a7c1760',
    'a1979af6-5761-4483-8a50-6ba57729f769',
    'ada35081-9ec4-4eb8-98b2-3ce350d5427f',
    'b82d4112-06e7-42bb-bd70-4e83cdfe5df0',
    'ccc4ed14-6c87-408b-9934-7a0d279d853a',
    'cdf9ebbd-b0fe-4fce-94b4-512f2a574f18',
    'e4e45509-bfc0-4aee-b73e-17b7582bf7e1',
    'f10ff9a5-0428-4700-8676-96ad36c4ac64',
  ].map((e) => book
    ? stripIdVersion(assertDefined(assertDefined(findArchiveTreeNode(book.tree, e), '').parent, '').id)
    : e)
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
  highlightLocationFilters,
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
    console.log(totalCounts, locationFilters, colorFilters, '--------')
    return flow(
      (counts) => filterCountsPerSourceByLocationFilter(locationFilters, counts),
      (counts) => filterCountsPerSourceByColorFilter([...colorFilters], counts)
    )(totalCounts)
  }
);

export const orderedStudyGuidesHighlights = createSelector(
  studyGuidesHighlights,
  highlightLocationFilters,
  getSortedSummaryHighlights
);
