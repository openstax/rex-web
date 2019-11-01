import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { bookAndPage } from '../../selectors';
import { updateHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof updateHighlight> = ({getState, highlightClient}) => async({payload}) => {
  const state = getState();
  const {book, page} = bookAndPage(state);

  if (!book || !page) {
    return;
  }

  highlightClient.updateHighlight(book, page, payload);
};

export default actionHook(updateHighlight, hookBody);
