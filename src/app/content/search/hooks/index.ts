import isEqual from 'lodash/fp/isEqual';
import queryString from 'query-string';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { replace } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { ActionHookBody } from '../../../types';
import { SearchResultHits } from '@openstax/open-search-client';
import { actionHook, isNetworkError } from '../../../utils';
import { assertDefined } from '../../../utils/assertions';
import { openToc } from '../../actions';
import { content } from '../../routes';
import * as selectContent from '../../selectors';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { createNavigationMatch } from '../../utils/navigationUtils';
import { clearSearch, openSearchInSidebar, receiveSearchResults, requestSearch, selectSearchResult } from '../actions';
import { SearchLoadError } from '../errors';
import { isSearchScrollTarget } from '../guards';
import * as select from '../selectors';
import { findSearchResultHit } from '../utils';
import trackSearch from './trackSearch';
import Sentry from '../../../../helpers/Sentry';
import { htmlToText } from '../components/SearchResultsSidebar/SearchResultHits';

export const requestSearchHook: ActionHookBody<typeof requestSearch> = (services) => async({payload, meta}) => {
  const state = services.getState();
  const book = selectContent.book(state);

  if (!book || !payload) {
    return;
  }

  const results = await services.searchClient.search({
    books: [`${book.archiveVersion}/${book.id}@${book.contentVersion}`],
    indexStrategy: 'i1',
    q: payload,
    searchStrategy: 's1',
  }).catch((error) => {
    if (!isNetworkError(error)) {
      Sentry.captureException(error);
    }
    throw ensureApplicationErrorType(
      error,
      new SearchLoadError({ destination: 'page', shouldAutoDismiss: false })
    );
  }).then((results1) => {
    const quotedTerms = getQuotedTerms(payload);

    if (quotedTerms.length) {
      results1.hits = filterByQuotedTerms(results1.hits, quotedTerms);
    }
    return results1;
  });

  services.dispatch(receiveSearchResults(results, meta));
};

function getQuotedTerms(terms: string) {
  const matches = terms.match(/".*?"/g) ?? [];

  return matches.map((m) => m.replace(/"/g, ''));
}

function termsAppearIn(terms: string[], html: string) {
  const plain = htmlToText(html);

  return terms.some((t) => plain?.toLowerCase().includes(t.toLowerCase()));
}

function filterByQuotedTerms(hits: SearchResultHits, quotedTerms: string[]) {
  for (const h of hits.hits) {
    if (h.highlight.visibleContent) {
      h.highlight.visibleContent = h.highlight.visibleContent.filter((c) => termsAppearIn(quotedTerms, c));
    }
  }
  // Rebuilding so the fields are approximately correct, though probably unnecessary
  const newHitsArray = hits.hits.filter((h) => {
    if (h.highlight.visibleContent) {
      return h.highlight.visibleContent.length > 0;
    }

    return termsAppearIn(quotedTerms, h.highlight.title as string);
  });
  const scores = newHitsArray.map((h) => h.score);
  const maxScore = Math.max(...scores);

  return {
    total: newHitsArray.length,
    maxScore,
    hits: newHitsArray,
  };
}


export const receiveSearchHook: ActionHookBody<typeof receiveSearchResults> = (services) => ({meta}) => {
  const state = services.getState();
  const {page: currentPage, book} = selectContent.bookAndPage(state);
  const pageIsLoading = selectContent.loadingPage(state);

  if (pageIsLoading || !book) {
    return; // book changed while query was in the air
  }

  const results = select.hits(state);
  const searchResultHit = meta?.searchScrollTarget &&
    findSearchResultHit(results, meta.searchScrollTarget, state?.content?.page?.id);
  const selectedResult = searchResultHit && meta.searchScrollTarget
    ? {result: searchResultHit, highlight: meta.searchScrollTarget.index}
    : null;

  if (selectedResult) {
    services.dispatch(selectSearchResult(selectedResult));
  }

  const targetPageId = selectedResult?.result.source.pageId || currentPage?.id;

  const action = replace;

  const persistentQueryParams = selectNavigation.persistentQueryParameters(state);
  const systemQueryParams = selectNavigation.systemQueryParameters(state);
  const query = select.query(state);
  const options = selectedResult
    ? {
      hash: selectedResult.result.source.elementId,
      search: queryString.stringify({
        modal: persistentQueryParams.modal,
        query,
        target: JSON.stringify({ type: 'search', index: selectedResult.highlight }),
        ...systemQueryParams,
      }),
    }
    : { search: queryString.stringify({ query, modal: persistentQueryParams.modal }) };

  const navigationMatch = targetPageId
    ? createNavigationMatch(
      assertDefined(
        findArchiveTreeNodeById(book.tree, targetPageId),
        'search result pointed to page that wasn\'t in book'
      ), book)
    : selectNavigation.match(state);

  if (navigationMatch) {
    services.dispatch(action(navigationMatch, options));
  }
};

export const clearSearchHook: ActionHookBody<typeof clearSearch | typeof openToc> = (services) => () => {
  const state = services.getState();
  const query = selectNavigation.query(state);

  if (!Object.keys(query).length) {
    return;
  }

  const scrollTarget = selectNavigation.scrollTarget(state);
  const hash = selectNavigation.hash(state);
  const systemQueryParams = selectNavigation.systemQueryParameters(state);
  const persistentQueryParams = selectNavigation.persistentQueryParameters(state);
  const newTarget = scrollTarget && isSearchScrollTarget(scrollTarget) ? '' : persistentQueryParams.target;
  const newPersistentParams = {...persistentQueryParams, query: undefined, target: newTarget || undefined};

  services.history.replace({
    hash: scrollTarget && isSearchScrollTarget(scrollTarget) ? '' : hash,
    search: queryString.stringify(systemQueryParams) + queryString.stringify(newPersistentParams),
  });
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async() => {
  const state = services.getState();
  const navigationQuery = selectNavigation.query(state).query;
  const searchQuery = select.query(state);
  const scrollTarget = selectNavigation.scrollTarget(state);
  const searchScrollTarget = scrollTarget && isSearchScrollTarget(scrollTarget) ? scrollTarget : null;
  const searchHits = select.hits(state);
  const targettedHit = searchScrollTarget &&
    findSearchResultHit(searchHits, searchScrollTarget, state?.content?.page?.id);
  const navigationSelectedResult = targettedHit && searchScrollTarget
    ? { result: targettedHit, highlight: searchScrollTarget.index }
    : null;
  const currentSelectedResult = select.selectedResult(state);

  if (typeof navigationQuery === 'string' && navigationQuery !== searchQuery) {
    services.dispatch(requestSearch(
      navigationQuery,
      searchScrollTarget ? { isResultReload: true, searchScrollTarget } : undefined
    ));
  } else if (
    navigationSelectedResult
    && (!currentSelectedResult || !isEqual(navigationSelectedResult, currentSelectedResult))
  ) {
    services.dispatch(selectSearchResult(navigationSelectedResult));
  }
};

// Search in sidebar experiment
export const openSearchInSidebarHook: ActionHookBody<typeof openSearchInSidebar> = (services) => () => {
  // Restore search state when opening sidebar
  const state = services.getState();
  const previousState = select.previousState(state);
  const { query, selectedResult } = previousState;

  if (!query) {
    return;
  }

  const hash = selectNavigation.hash(state);
  const systemQueryParams = selectNavigation.systemQueryParameters(state);
  const options = selectedResult
    ? {
      hash: selectedResult.result.source.elementId,
      search: queryString.stringify({
        query,
        target: JSON.stringify({ type: 'search', index: selectedResult.highlight }),
        ...systemQueryParams,
      }),
    }
    : { search: queryString.stringify({ query }) };

  services.history.replace({
    hash,
    ...options,
  });
};

export default [
  trackSearch,
  actionHook(clearSearch, clearSearchHook),
  actionHook(openToc, clearSearchHook),
  actionHook(openSearchInSidebar, openSearchInSidebarHook),
  actionHook(requestSearch, requestSearchHook),
  actionHook(receiveSearchResults, receiveSearchHook),
];
