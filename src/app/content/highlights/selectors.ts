import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { HighlightLocations } from './types';
import { getHighlightLocationsFromBook } from './utils';

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

export const highlightLocations = createSelector(
  parentSelectors.book,
 (state) => state
  ? getHighlightLocationsFromBook(state)
  : new Map() as HighlightLocations
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
