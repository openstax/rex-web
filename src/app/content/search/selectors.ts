import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import {
  countTotalHighlights,
  countUniqueKeyTermHighlights,
  getFilteredResults,
  getFormattedSearchResults,
  getNonKeyTermResults,
  getSearchResultsForPage,
  matchKeyTermHit,
} from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.search
);

export const searchResultsOpen = createSelector(
  localState,
  (state) => !!state.query && state.sidebarOpen
);

const getRawResults = createSelector(
  localState,
  (state) => state.results
);

const filteredResults = createSelector(
  getRawResults,
  (rawResults) => rawResults ? getFilteredResults(rawResults) : null
);

export const hasResults = createSelector(
  filteredResults,
  (selectedResults) => !!selectedResults
);

export const query = createSelector(
  localState,
  (state) => state.query
);

export const selectedResult = createSelector(
  localState,
  (state) => state.selectedResult
);

const nonKTHits = createSelector(
  filteredResults,
  (selectedResults) => selectedResults ? selectedResults.hits.hits.filter((hit) => !matchKeyTermHit(hit)) : null
);

const keyTermHits = createSelector(
  filteredResults,
  (selectedResults) => selectedResults ? selectedResults.hits.hits.filter(matchKeyTermHit) : null
);

export const keyTermHitsInTitle = createSelector(
  keyTermHits,
  (selectedHits) => selectedHits ? selectedHits.filter((hit) => !!hit.highlight.title) : null
);

export const hits = createSelector(
  nonKTHits,
  keyTermHitsInTitle,
  (chapterHits, filteredkeyTermHits) => [...(chapterHits || []), ...(filteredkeyTermHits || [])]
);

export const totalHits = createSelector(
  nonKTHits,
  (hitsOrNull) => hitsOrNull ? countTotalHighlights(hitsOrNull) : null
);

export const totalHitsKeyTerms = createSelector(
  keyTermHitsInTitle,
  (keyTermHitsOrNull) => keyTermHitsOrNull ? countUniqueKeyTermHighlights(keyTermHitsOrNull) : null
);

export const results = createSelector(
  filteredResults,
  parentSelectors.book,
  (selectedResults, book) => selectedResults && book ? getFormattedSearchResults(book.tree, selectedResults) : null
);

const rawNonKTResults = createSelector(
  filteredResults,
  (selectedResults) => selectedResults ? getNonKeyTermResults(selectedResults) : null
);

export const nonKeyTermResults = createSelector(
  rawNonKTResults,
  parentSelectors.book,
  (selectedResults, book) => selectedResults && book ? getFormattedSearchResults(book.tree, selectedResults) : null
);

export const mobileToolbarOpen = createSelector(
  localState,
  (state) => state.mobileToolbarOpen
);

export const currentPageResults = createSelector(
  filteredResults,
  parentSelectors.page,
  (selectedResults, page) => selectedResults && page ? getSearchResultsForPage(page, selectedResults) : []
);

export const userSelectedResult = createSelector(
  localState,
  (state) => state.userSelectedResult
);
