import flow from 'lodash/fp/flow';
import mapValues from 'lodash/fp/mapValues';
import merge from 'lodash/fp/merge';
import reduce from 'lodash/fp/reduce';
import size from 'lodash/fp/size';
import values from 'lodash/fp/values';
import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { enabledForBooks } from './constants';
import { HighlightLocationFilters } from './types';
import { getHighlightLocationFilters } from './utils';
import { filterCountsPerSourceByChapters, filterCountsToUnvisitiedPages } from './utils/paginationUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.highlights
);

export const isEnabled = createSelector(
  localState,
  parentSelectors.book,
  (state, book) => !!state.enabled && !!book && enabledForBooks.includes(book.id)
);

export const highlightsLoaded = createSelector(
  localState,
  (state) => state.highlights !== null
);

export const highlights = createSelector(
  localState,
  (state) => state.highlights || []
);

export const highlightLocationFilters = createSelector(
  parentSelectors.book,
 (book) => book
  ? getHighlightLocationFilters(book)
  : new Map() as HighlightLocationFilters
);

export const totalCountsPerPage = createSelector(
  localState,
  (state) => state.totalCountsPerPage
);

export const focused = createSelector(
  localState,
  (state) => state.focused
);

export const myHighlightsOpen = createSelector(
  localState,
  (state) => state.myHighlightsOpen
);

export const summaryIsLoading = createSelector(
  localState,
  (state) => state.summary.loading
);

export const summaryFilters = createSelector(
  localState,
  (state) => state.summary.filters
);

export const summaryHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
);

const loadedCountsPerSource = createSelector(
  summaryHighlights,
  flow(
    values,
    reduce(merge, {}),
    mapValues(size)
  )
);

/*
 * this is wrong, it shouldn't be loading from totalCountsPerPage,
 * it should be loading from a different summary that was fetched
 * from the api after filters are changed and is filtered based
 * on the selected colors.
 *
 * its probably better to do this location filtering on write
 * after loading the color filtered data from the api, then store
 * that in the state
 */
const filteredCountsPerSource = createSelector(
  highlightLocationFilters,
  totalCountsPerPage,
  (filters, counts) => filterCountsPerSourceByChapters(filters, counts)
);

export const remainingSourceCounts = createSelector(
  loadedCountsPerSource,
  filteredCountsPerSource,
  (loadedCounts, totalCounts) => filterCountsToUnvisitiedPages(loadedCounts, totalCounts)
);
