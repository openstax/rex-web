import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { user } from '../../../auth/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import { bookAndPage } from '../../selectors';
import { receiveHighlights } from '../actions';

const hookBody: RouteHookBody<typeof content> = ({dispatch, getState, highlightClient}) => async() => {
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);

  if (!authenticated || !book || !page || typeof(window) === 'undefined') {
    return;
  }

  const highlights = await highlightClient.getHighlights({
    perPage: 100,
    scopeId: book.id,
    sourceIds: [page.id],
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }
};

export default hookBody;
