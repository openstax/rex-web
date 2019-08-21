import { push, replace } from '../../navigation/actions';
import { RouteHookBody } from '../../navigation/types';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { actionHook, assertDefined } from '../../utils';
import { content } from '../routes';
import * as selectContent from '../selectors';
import { findArchiveTreeNode } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import { getBookPageUrlAndParams } from '../utils/urlUtils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from './actions';
import * as select from './selectors';
import { getFirstResult, getIndexData, getSearchFromLocation } from './utils';

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

  services.dispatch(receiveSearchResults(results, meta));
};

export const receiveSearchHook: ActionHookBody<typeof receiveSearchResults> = (services) => ({payload, meta}) => {
  const state = services.getState();
  const {page, book} = selectContent.bookAndPage(state);
  const search = select.query(state);
  const savedQuery = getSearchFromLocation(services.history.location);

  if (!page || !book) {
    return; // book changed while query was in the air
  }

  const firstResult = getFirstResult(book, payload);

  if (firstResult && book.id === getIndexData(firstResult.result.index).bookId) {
    services.dispatch(selectSearchResult(firstResult));
  }

  if (!firstResult) {
    return;
  }

  const targetPageId = firstResult.result.source.pageId;
  const targetPage = assertDefined(
    findArchiveTreeNode(book.tree, targetPageId),
    'search result pointed to page that wasn\'t in book'
  );

  if (savedQuery === search && page.id === stripIdVersion(targetPage.id)) {
    return; // if search and page match current history record, noop
  }

  if (meta && meta.skipNavigation) {
    return;
  }

  const navigation = {
    params: getBookPageUrlAndParams(book, targetPage).params,
    route: content,
    state : {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: stripIdVersion(targetPage.id),
      search,
    },
  };

  const action = stripIdVersion(page.id) === stripIdVersion(targetPage.id) ? replace : push;

  services.dispatch(action(navigation));
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async(locationChange) => {
  const query = select.query(services.getState());
  const savedQuery = getSearchFromLocation(locationChange.location);

  if (locationChange.action === 'POP') { // on initial load or back/forward button, load state
    loadSearch(services, query, savedQuery);
  }
};

export default [
  actionHook(requestSearch, requestSearchHook),
  actionHook(receiveSearchResults, receiveSearchHook),
];

function loadSearch(
  services: AppServices & MiddlewareAPI,
  query: string | null,
  savedQuery: string | null
) {
  if (savedQuery && savedQuery !== query) {
    services.dispatch(requestSearch(savedQuery, {skipNavigation: true}));
  } else if (!savedQuery && query) {
    services.dispatch(clearSearch());
  }
}
