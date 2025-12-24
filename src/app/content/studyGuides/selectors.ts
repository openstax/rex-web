import { createSelector } from 'reselect';
import * as authSelectors from '../../auth/selectors';
import * as selectFeatureFlags from '../../featureFlags/selectors';
import * as navigationSelectors from '../../navigation/selectors';
import { studyGuidesFeatureFlag } from '../constants';
import { getHighlightColorFiltersWithContent, getHighlightLocationFilterForPage } from '../highlights/utils';
import {
  getHighlightLocationFilters,
  getHighlightLocationFiltersWithContent,
  getSortedSummaryHighlights,
} from '../highlights/utils';
import {
  checkIfHasMoreResults,
  filterCounts,
  getLoadedCountsPerSource,
  getSelectedHighlightsLocationFilters,
} from '../highlights/utils/selectorsUtils';
import * as parentSelectors from '../selectors';
import { archiveTreeSectionIsChapter } from '../utils/archiveTreeUtils';
import { colorfilterLabels } from './constants';
import { getFiltersFromQuery } from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.studyGuides
);

export const studyGuidesEnabled = createSelector(
  selectFeatureFlags.localState,
  (state) => !!state[studyGuidesFeatureFlag]
);

export const studyGuidesSummary = createSelector(
  localState,
  (state) => state.summary
);

export const studyGuidesFilters = createSelector(
  studyGuidesSummary,
  (summary) => summary.filters
);

export const hasStudyGuides = createSelector(
  studyGuidesSummary,
  (summary) => summary.totalCountsPerPage
    && Object.keys(summary.totalCountsPerPage).length > 0
);

export const totalCountsPerPage = createSelector(
  studyGuidesSummary,
  (summary) => summary.totalCountsPerPage
);

export const totalCountsPerPageOrEmpty = createSelector(
  studyGuidesSummary,
  (summary) => summary.totalCountsPerPage || {}
);

export const studyGuidesOpen = createSelector(
  studyGuidesSummary,
  studyGuidesEnabled,
  parentSelectors.book,
  parentSelectors.page,
  (summary, flagEnabled, book, page) => summary.open && flagEnabled && !!book && !!page
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
  getHighlightLocationFilters(archiveTreeSectionIsChapter)
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

export const highlightColorFiltersWithContent = createSelector(
  totalCountsPerPageOrEmpty,
  getHighlightColorFiltersWithContent
);

export const defaultLocationFilter = createSelector(
  studyGuidesLocationFilters,
  parentSelectors.page,
  (filters, currentPage) => currentPage && getHighlightLocationFilterForPage(filters, currentPage)
);

const filtersFromQuery = createSelector(
  navigationSelectors.query,
  (query) => getFiltersFromQuery(query)
);

const loggedIn = createSelector(
  authSelectors.loggedOut,
  (loggedOut) => !loggedOut
);

export const loggedOutAndQueryMissingFirstChapter = createSelector(
  loggedIn,
  parentSelectors.firstChapter,
  filtersFromQuery,
  (logged, firstChapter, queryFilters) =>
    !logged && firstChapter && !queryFilters.locationIds?.includes(firstChapter.id)
);

const defaultFilters = createSelector(
  loggedIn,
  defaultLocationFilter,
  highlightColorFiltersWithContent,
  parentSelectors.firstChapter,
  (logged, defaultLocation, colorFilters, firstChapter) => ({
    colors: Array.from(colorFilters.size ? colorFilters : colorfilterLabels),
    locationIds: logged && defaultLocation
      ? [defaultLocation.id]
      : (!logged && firstChapter ? [firstChapter.id] : []),
  })
);

export const summaryFilters = createSelector(
  loggedIn,
  defaultFilters,
  studyGuidesFilters,
  (logged, defaults, filtersFromState) => logged
    ? {
        ...defaults,
        ...(filtersFromState.colors && {colors: filtersFromState.colors}),
        ...(filtersFromState.locationIds && {locationIds: filtersFromState.locationIds}),
      } : defaults
);

const rawSummaryLocationFilters = createSelector(
  summaryFilters,
  (filters) => filters.locationIds
);

export const summaryColorFilters = createSelector(
  summaryFilters,
  highlightColorFiltersWithContent,
  (filters, withContent) => new Set(filters.colors.filter((color) => withContent.has(color)))
);

export const studyGuidesLocationFiltersWithContent = createSelector(
  studyGuidesLocationFilters,
  totalCountsPerPageOrEmpty,
  getHighlightLocationFiltersWithContent
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
  summaryColorFilters,
  filterCounts
);

export const hasMoreResults = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  summaryStudyGuidesPagination,
  checkIfHasMoreResults
);
