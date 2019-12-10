import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { filtersChange, receiveHighlights } from '../actions';
import { chaptersFilter, colorsFilter } from '../selectors';
import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';

const hookBody: ActionHookBody<typeof filtersChange> = ({dispatch, getState, highlightClient}) => async() => {
  const state = getState();
  const selectedChapters = chaptersFilter(state)
  const selectedColors = colorsFilter(state)

  const highlights = await highlightClient.getHighlights({
    perPage: 100,
    color: selectedColors[0] as any,
    sourceIds: selectedChapters,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  })

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }
};

export default actionHook(filtersChange, hookBody);
