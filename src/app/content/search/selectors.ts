import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import {
  countTotalHighlights,
  countUniqueKeyTermHighlights,
  getFormattedKeyTermResults,
  getFormattedSearchResults,
  getKeyTermResults,
  getSearchResultsForPage,
  getSortedKeyTermHits,
  matchKeyTermHit
} from './utils';

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

export const hits = createSelector(
  localState,
  (state) => state.results ? state.results.hits.hits.filter((hit) => !matchKeyTermHit(hit)) : null
);

export const keyTermHits = createSelector(
  localState,
  (state) => state.results ? state.results.hits.hits.filter(matchKeyTermHit) : null
);

export const totalHits = createSelector(
  hits,
  (hitsOrNull) => hitsOrNull ? countTotalHighlights(hitsOrNull) : null
);

export const totalHitsKeyTerms = createSelector(
  keyTermHits,
  (keyTermHitsOrNull) => keyTermHitsOrNull ? countUniqueKeyTermHighlights(keyTermHitsOrNull) : null
);

export const getRawResults = createSelector(
  localState,
  (state) => state.results
);

export const hasNonKeyTermResults = createSelector(
  getRawResults,
  (rawResults) => !!(rawResults && rawResults.hits.hits.find((hit) => !matchKeyTermHit(hit)))
);

export const keyTermResults = createSelector(
  getRawResults,
  parentSelectors.book,
  (rawResults, book) => rawResults && book ? getKeyTermResults(rawResults) : null
);

export const formattedkeyTermResults = createSelector(
  keyTermResults,
  parentSelectors.book,
  (selectedResults, book) => selectedResults && book ? getFormattedKeyTermResults(book.tree, selectedResults) : null
);

export const sortedKeyTermHits = createSelector(
  keyTermResults,
  parentSelectors.book,
  (selectedResults, book) => selectedResults && book ? getSortedKeyTermHits(book.tree, selectedResults) : null
);

export const results = createSelector(
  getRawResults,
  parentSelectors.book,
  (rawResults, book) => rawResults && book ? getFormattedSearchResults(book.tree, rawResults) : null
);

export const mobileToolbarOpen = createSelector(
  localState,
  (state) => state.mobileToolbarOpen
);

export const currentPageResults = createSelector(
  getRawResults,
  parentSelectors.page,
  (rawResults, page) => rawResults && page ? getSearchResultsForPage(page, rawResults) : []
);
