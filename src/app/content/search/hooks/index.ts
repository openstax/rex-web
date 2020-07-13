import isEqual from 'lodash/fp/isEqual';
import queryString from 'query-string';
import { push, replace } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { openToc } from '../../actions';
import { content } from '../../routes';
import * as selectContent from '../../selectors';
import { findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { getBookPageUrlAndParams } from '../../utils/urlUtils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from '../actions';
import * as select from '../selectors';
import { findSearchResultHit, getFirstResult, getIndexData,
  getSearchFromLocation, isSearchScrollTarget } from '../utils';
import trackSearch from './trackSearch';

export const requestSearchHook: ActionHookBody<typeof requestSearch> = (services) => async({payload, meta}) => {
  const state = services.getState();
  const book = selectContent.book(state);

  if (!book || !payload) {
    return;
  }

  const results = await services.searchClient.search({
    books: [`${book.id}@${book.version}`],
    indexStrategy: 'i1',
    q: payload,
    searchStrategy: 's1',
  });

  const params = queryString.parse(services.history.location.search);
  params.query = payload;
  services.history.replace({
    hash: services.history.location.hash,
    search: queryString.stringify(params),
  });

  services.dispatch(receiveSearchResults(results, meta));
};

export const receiveSearchHook: ActionHookBody<typeof receiveSearchResults> = (services) => ({payload, meta}) => {
  const state = services.getState();
  const {page, book} = selectContent.bookAndPage(state);
  const query = select.query(state);
  const results = select.hits(state) || [];
  const savedSearch = getSearchFromLocation(services.history.location);

  if (!page || !book) {
    return; // book changed while query was in the air
  }

  const searchResultHit = meta && meta.searchScrollTarget && findSearchResultHit(results, meta.searchScrollTarget);
  const selectedResult = searchResultHit && meta.searchScrollTarget
    ? {result: searchResultHit, highlight: meta.searchScrollTarget.index}
    : getFirstResult(book, payload);

  if (!selectedResult) {
    return;
  }

  const targetPageId = selectedResult.result.source.pageId;
  const targetPage = assertDefined(
    findArchiveTreeNode(book.tree, targetPageId),
    'search result pointed to page that wasn\'t in book'
  );

  const savedQuery = savedSearch ? savedSearch.query : null;
  if (
    savedQuery === query &&
    page.id === stripIdVersion(targetPage.id) &&
    isEqual(select.selectedResult(state), selectedResult)
  ) {
    return; // if search and page match current history record, noop
  }

  if (book.id !== getIndexData(selectedResult.result.index).bookId) {
    return;
  }

  services.dispatch(selectSearchResult(selectedResult));

  const navigation = {
    params: getBookPageUrlAndParams(book, targetPage).params,
    route: content,
    state : {
      // TODO: Check which of these are still required
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: stripIdVersion(targetPage.id),
      search: {query},
    },
  };

  const action = stripIdVersion(page.id) === stripIdVersion(targetPage.id) ? replace : push;
  const search = queryString.stringify({
    query,
    target: JSON.stringify({ type: 'search', index: selectedResult.highlight }),
  });
  const hash = selectedResult.result.source.elementId;

  services.dispatch(action(navigation, { hash, search }));
};

export const clearSearchHook: ActionHookBody<typeof clearSearch | typeof openToc> = (services) => () => {
  if (services.history.location.state && services.history.location.state.search) {
    services.history.replace({
      hash: '',
      search: '',
    });
  }
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async(/* locationChange */) => {
  const state = services.getState();
  const navigationState = selectNavigation.localState(state);
  const navigationQuery = navigationState.query.query;
  const searchQuery = select.query(state);
  const scrollTarget = selectNavigation.scrollTarget(state);
  const searchScrollTarget = scrollTarget && isSearchScrollTarget(scrollTarget) ? scrollTarget : null;
  const searchHits = select.hits(state) || [];
  const targettedHit = searchScrollTarget && findSearchResultHit(searchHits, searchScrollTarget);
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

export default [
  trackSearch,
  actionHook(clearSearch, clearSearchHook),
  actionHook(openToc, clearSearchHook),
  actionHook(requestSearch, requestSearchHook),
  actionHook(receiveSearchResults, receiveSearchHook),
];
