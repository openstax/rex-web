import { RouteHookBody } from '../../navigation/types';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { actionHook } from '../../utils';
import { content } from '../routes';
import * as contentSelectors from '../selectors';
import { clearSearch, receiveSearchResults, requestSearch } from './actions';
import * as select from './selectors';

export const searchHookBody: ActionHookBody<typeof requestSearch> = (services) => async({payload}) => {
  const state = services.getState();
  const book = contentSelectors.book(state);

  if (!book || !payload) {
    return;
  }

  const results = await services.searchClient.search({
    books: [`${book.id}@${book.version}`],
    indexStrategy: 'i1',
    q: payload,
    searchStrategy: 's1',
  });

  services.dispatch(receiveSearchResults(results));
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async(locationChange) => {
  const query = select.query(services.getState());

  if (locationChange.action === 'POP') { // on initial load or back/forward button, load state
    loadSearch(services, query);
  }
};

export default [
  actionHook(requestSearch, searchHookBody),
];

function loadSearch(services: AppServices & MiddlewareAPI, query: string | null) {
  const savedState = services.history.location.state;

  if (savedState && savedState.search && savedState.search !== query) {
    services.dispatch(requestSearch(savedState.search));
  } else if (savedState && !savedState.search) {
    services.dispatch(clearSearch());
  }
}
