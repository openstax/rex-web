import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { actionHook } from '../../utils';
import * as contentSelectors from '../selectors';
import { clearSearch, receiveSearchResults, requestSearch } from './actions';
import * as select from './selectors';

export const searchHookBody: ActionHookBody<typeof requestSearch> = (services) => async({payload}) => {
  const state = services.getState();
  const book = contentSelectors.book(state);

  if (!book || !payload) {
    return;
  }

  saveSearch(services, payload);

  const results = await services.searchClient.search({
    books: [`${book.id}@${book.version}`],
    indexStrategy: 'i1',
    q: payload,
    searchStrategy: 's1',
  });

  services.dispatch(receiveSearchResults(results));

  console.log(services.history);
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch = async(services: AppServices & MiddlewareAPI) => {
  const query = select.query(services.getState());

  if (services.history.action === 'POP') { // on initial load or back/forward button, load state
    loadSearch(services, query);
  } else if (services.history.action === 'PUSH') { // on push save the current state to the new record
    saveSearch(services, query);
  }

  console.log(services.history);
};

export default [
  actionHook(requestSearch, searchHookBody),
];

function loadSearch(services: AppServices & MiddlewareAPI, query: string | null) {
  const savedState = services.history.location.state;

  if (savedState && savedState.search && savedState.search !== query) {
    console.log(`loading ${savedState.search} over ${query}`);
    services.dispatch(requestSearch(savedState.search));
  } else if (savedState && !savedState.search) {
    console.log('clearing search');
    services.dispatch(clearSearch());
  }
}

function saveSearch({history}: AppServices, search: string | null) {

  if (history.location.state && history.location.state.search !== search) {
    console.log(`saving ${search} over ${history.location.state.search}`);
    history.replace({
     state: {...history.location.state, search},
    });
  }
}
