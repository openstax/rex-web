import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import { bookAndPage } from '../../selectors';
import { receiveHighlights } from '../actions';

const hookBody: RouteHookBody<typeof content> = ({dispatch, getState, highlightClient}) => async() => {
  const state = getState();
  const {book, page} = bookAndPage(state);

  if (!book || !page) {
    return;
  }

  const highlights = await highlightClient.getHighlightsByPage(book, page);

  dispatch(receiveHighlights(highlights));
};

export default hookBody;
