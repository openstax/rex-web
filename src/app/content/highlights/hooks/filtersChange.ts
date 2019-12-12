import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { findTreePages } from '../../utils/archiveTreeUtils';
import { filtersChange, receiveSummaryHighlights, setIsLoadingSummary } from '../actions';
import { chaptersFilter, colorsFilter, summaryIsLoading } from '../selectors';
import { SummaryHighlights } from '../types';

const hookBody: ActionHookBody<typeof filtersChange> = ({dispatch, getState, highlightClient}) => async() => {
  const state = getState();
  const book = bookSelector(state);
  const selectedChapters = chaptersFilter(state);
  const selectedColors = colorsFilter(state);
  const isLoading = summaryIsLoading(state);

  if (!book || isLoading) { return; }

  dispatch(setIsLoadingSummary(true));

  const highlights = await highlightClient.getHighlights({
    colors: selectedColors as unknown as GetHighlightsColorsEnum[],
    perPage: 30,
    scopeId: book.id,
    sourceIds: selectedChapters,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (highlights.data && book) {
    const pages = findTreePages(book.tree);
    const summaryHighlights: SummaryHighlights = {};

    for (const h of highlights.data) {
      const pageId = h.sourceId!;

      const page = pages.find((p) => p.id === pageId);
      const chapterId = page && page.parent.id;
      if (!chapterId) { continue; }

      if (summaryHighlights[chapterId]) {
        if (summaryHighlights[chapterId][pageId]) {
          summaryHighlights[chapterId][pageId].push(h);
        } else {
          summaryHighlights[chapterId] = {
            [pageId]: [h],
          };
        }
      } else {
        summaryHighlights[chapterId] = {
          [pageId]: [h],
        };
      }
    }

    dispatch(receiveSummaryHighlights(summaryHighlights));
  } else {
    dispatch(setIsLoadingSummary(false));
  }
};

export default actionHook(filtersChange, hookBody);
