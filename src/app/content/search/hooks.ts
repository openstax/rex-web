import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import * as contentSelectors from '../selectors';
import { receiveSearchResults, requestSearch } from './actions';

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

export default [
  actionHook(requestSearch, searchHookBody),
];
