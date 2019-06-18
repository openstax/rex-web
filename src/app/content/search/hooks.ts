import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { actionHook, assertDocument, assertWindow } from '../../utils';
import * as contentSelectors from '../selectors';
import { receiveSearchResults, requestSearch } from './actions';
import * as select from './selectors';

export const searchHookBody: ActionHookBody<typeof requestSearch> = (services) => async({payload}) => {
  const state = services.getState();
  const book = contentSelectors.book(state);

  if (!book || !payload) {
    return;
  }

  saveSearch(payload);

  const results = await services.searchClient.search({
    books: [`${book.id}@${book.version}`],
    indexStrategy: 'i1',
    q: payload,
    searchStrategy: 's1',
  });

  services.dispatch(receiveSearchResults(results));
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch = async(services: AppServices & MiddlewareAPI) => {
  const state = services.getState();
  const query = select.query(state);

  const history = assertWindow().history;

  if (history.state.search && history.state.search !== query) {
    services.dispatch(requestSearch(history.state.search));
  } else if (!history.state.search && query) {
    saveSearch(query);
  }

};

export default [
  actionHook(requestSearch, searchHookBody),
];

function saveSearch(search: string) {
  const history = assertWindow().history;
  history.replaceState({...history.state, search}, assertDocument().title);
}
