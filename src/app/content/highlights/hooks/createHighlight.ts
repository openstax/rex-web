import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { bookAndPage } from '../../selectors';
import { createHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> = ({getState, highlightClient}) => async({payload}) => {
  const state = getState();
  const {book, page} = bookAndPage(state);

  if (!book || !page) {
    return;
  }

  highlightClient.addHighlight({highlight: {
    ...payload,
    scopeId: book.id,
    sourceId: page.id,
    sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
  }});
};

export default actionHook(createHighlight, hookBody);
