import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { isArchiveTree } from '../../guards';
import { book as bookSelector } from '../../selectors';
import * as archiveTreeUtils from '../../utils/archiveTreeUtils';
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

  const flatBook = archiveTreeUtils.flattenArchiveTree(book.tree);
  let sourceIds: string[] = [];

  for (const filterId of selectedChapters) {
    const pageOrChapter = flatBook.find(archiveTreeUtils.nodeMatcher(filterId));
    if (!pageOrChapter) { continue; }

    const pageIds = isArchiveTree(pageOrChapter)
      ? archiveTreeUtils.findTreePages(pageOrChapter).map((p) => p.id)
      : [filterId];

    sourceIds = [...sourceIds, ...pageIds];
  }

  const highlights = await highlightClient.getHighlights({
    colors: selectedColors as unknown as GetHighlightsColorsEnum[],
    perPage: 30,
    scopeId: book.id,
    sourceIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (highlights.data && book) {
    const pages = archiveTreeUtils.findTreePages(book.tree);
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
