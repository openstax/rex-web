import * as selectNavigation from '../../../navigation/selectors';
import { Match } from '../../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../../types';
import { receiveSearchResults } from '../../actions';
import { content } from '../../routes';
import { Book } from '../../types';

export default async(
  book: Book,
  services: AppServices & MiddlewareAPI,
  _match: Match<typeof content>
) => {
  const state = services.getState();
  const {search} = selectNavigation.query(state);

  if (typeof(search) !== 'string') {
    return;
  }

  const results = await services.searchClient.search({
    books: [`${book.id}@${book.version}`],
    indexStrategy: 'i1',
    q: search,
    searchStrategy: 's1',
  });

  services.dispatch(receiveSearchResults(results.rawResults));
};
