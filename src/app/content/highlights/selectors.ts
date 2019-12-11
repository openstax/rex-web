import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import fromPairs from 'lodash/fp/fromPairs';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import size from 'lodash/fp/size';
import toPairs from 'lodash/fp/toPairs';
import values from 'lodash/fp/values';
import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getRemainingSourceCounts } from './utils/paginationUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.highlights
);

export const isEnabled = createSelector(
  localState,
  (state) => !!state.enabled
);

export const highlightsLoaded = createSelector(
  localState,
  (state) => state.highlights !== null
);

export const highlights = createSelector(
  localState,
  (state) => state.highlights || []
);

export const summaryHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
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

const loadedCountsPerPageInSummary = createSelector(
  summaryHighlights,
  flow(
    values,
    map(toPairs),
    flatten,
    fromPairs,
    mapValues(size)
  )
);

const filteredTotalCountsPerPageInSummary = createSelector(
  localState,
  (state) => state.summary.filteredTotalCounts
);

export const totalCountsPerPageInSummary = createSelector(
  localState,
  (state) => state.summary.totalCounts
);

export const remainingSourceCounts = createSelector(
  loadedCountsPerPageInSummary,
  filteredTotalCountsPerPageInSummary,
  (loadedCounts, totalCounts) => getRemainingSourceCounts(loadedCounts, totalCounts)
);
