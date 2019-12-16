import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { isArchiveTree } from '../../guards';
import { book as bookSelector, bookSections } from '../../selectors';
import * as archiveTreeUtils from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { summaryFilters } from '../selectors';
import { SummaryHighlights } from '../types';

export const hookBody: ActionHookBody<typeof setSummaryFilters> = ({
  dispatch, getState, highlightClient,
}) => async() => {
  const state = getState();
  const book = bookSelector(state);
  const sections = bookSections(state);
  const {chapters, colors} = summaryFilters(state);

  if (!book) { return; }

  const summaryHighlights: SummaryHighlights = {};

  // When we make api call without filters it is returning all highlights
  // so we manually set it to empty object.
  if (chapters.length === 0 || colors.length === 0) {
    dispatch(receiveSummaryHighlights(summaryHighlights));
    return;
  }

  const flatBook = archiveTreeUtils.flattenArchiveTree(book.tree);
  let sourceIds: string[] = [];

  for (const filterId of chapters) {
    const pageOrChapter = flatBook.find(archiveTreeUtils.nodeMatcher(filterId));
    if (!pageOrChapter) { continue; }

    const pageIds = isArchiveTree(pageOrChapter)
      ? archiveTreeUtils.findTreePages(pageOrChapter).map((p) => p.id)
      : [filterId];

    sourceIds = [...sourceIds, ...pageIds];
  }

  const highlights = await highlightClient.getHighlights({
    colors: colors as unknown as GetHighlightsColorsEnum[],
    perPage: 30,
    scopeId: book.id,
    sourceIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (!highlights.data) {
    dispatch(receiveSummaryHighlights(summaryHighlights));
    return;
  }

  const pages = archiveTreeUtils.findTreePages(book.tree);

  for (const h of highlights.data) {
    const pageId = stripIdVersion(h.sourceId);

    // SectionId can be the same as pageId for ex. for Preface
    if (sections.has(pageId)) {
      summaryHighlights[pageId] = {
        [pageId]: [h],
      };
      continue;
    }

    const page = pages.find((p) => p.id === pageId);
    const chapterId = page && stripIdVersion(page.parent.id);
    if (!chapterId) { continue; }

    if (summaryHighlights[chapterId]) {
      if (summaryHighlights[chapterId][pageId]) {
        summaryHighlights[chapterId][pageId].push(h);
      } else {
        summaryHighlights[chapterId][pageId] = [h];
      }
    } else {
      summaryHighlights[chapterId] = {
        [pageId]: [h],
      };
    }
  }

  dispatch(receiveSummaryHighlights(summaryHighlights));
};

export default actionHook(setSummaryFilters, hookBody);
