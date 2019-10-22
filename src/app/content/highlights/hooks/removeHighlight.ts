import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { bookAndPage } from '../../selectors';
import { deleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof deleteHighlight> = ({getState, highlightClient}) => async({payload}) => {
  const state = getState();
  const {book, page} = bookAndPage(state);

  if (!book || !page) {
    return;
  }

  highlightClient.deleteHighlight(book, page, payload);
};

export default actionHook(deleteHighlight, hookBody);
