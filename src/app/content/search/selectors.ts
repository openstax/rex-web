import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getFormattedSearchResults, countTotalHighlights, getSearchResultsForPage } from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.search
);

export const searchResultsOpen = createSelector(
  localState,
  (state) => !!state.query && state.sidebarOpen
);

export const hasResults = createSelector(
  localState,
  (state) => !!state.results
);

export const query = createSelector(
  localState,
  (state) => state.query
);

export const selectedResult = createSelector(
  localState,
  (state) => state.selectedResult
);

export const totalHits = createSelector(
  localState,
  (state) => !!state.results ? countTotalHighlights(state.results.hits.hits) : null
);

export const results = createSelector(
  localState,
  parentSelectors.book,
  (state, book) => !!state.results && !!book ? getFormattedSearchResults(book.tree, state.results) : null
);

export const mobileToolbarOpen = createSelector(
  localState,
  (state) => state.mobileToolbarOpen
);

export const currentPageResults = createSelector(
  localState,
  parentSelectors.page,
  (state, page) => state.results && page ? getSearchResultsForPage(page, state.results) : []
);
