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
import { filterCountsToUnvisitiedPages } from './utils/paginationUtils';

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

const filteredCountsPerPage = createSelector(
  localState,
  (state) => state.summary.filteredCountsPerPage
);

export const remainingSourceCounts = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  (loadedCounts, totalCounts) => filterCountsToUnvisitiedPages(loadedCounts, totalCounts)
);
