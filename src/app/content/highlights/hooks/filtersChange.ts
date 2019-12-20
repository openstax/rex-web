import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { isArchiveTree } from '../../guards';
import { book as bookSelector } from '../../selectors';
import * as archiveTreeUtils from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { highlightLocationFilters, summaryFilters } from '../selectors';
import { SummaryHighlights } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../utils';

export const hookBody: ActionHookBody<typeof setSummaryFilters> = ({
  dispatch, getState, highlightClient,
}) => async() => {
  const state = getState();
  const book = bookSelector(state);
  const locationFilters = highlightLocationFilters(state);
  const {locationIds, colors} = summaryFilters(state);

  if (!book) { return; }

  let summaryHighlights: SummaryHighlights = {};

  // When we make api call without filters it is returning all highlights
  // so we manually set it to empty object.
  if (locationIds.length === 0 || colors.length === 0) {
    dispatch(receiveSummaryHighlights(summaryHighlights));
    return;
  }

  const flatBook = archiveTreeUtils.flattenArchiveTree(book.tree);
  const sourceIds: string[] = [];

  for (const filterId of locationIds) {
    const pageOrChapter = flatBook.find(archiveTreeUtils.nodeMatcher(filterId));
    if (!pageOrChapter) { continue; }

    const pageIds = isArchiveTree(pageOrChapter)
      ? archiveTreeUtils.findTreePages(pageOrChapter).map((p) => p.id)
      : [filterId];

    sourceIds.push(...pageIds);
  }

  const highlights = await highlightClient.getHighlights({
    colors: colors as unknown as GetHighlightsColorsEnum[],
    perPage: 30,
    scopeId: book.id,
    sourceIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (!highlights || !highlights.data) {
    dispatch(receiveSummaryHighlights(summaryHighlights));
    return;
  }

  for (const highlight of highlights.data) {
    const pageId = stripIdVersion(highlight.sourceId);
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);
    const locationFilterId = location && stripIdVersion(location.id);
    if (!locationFilterId) { continue; }
    summaryHighlights = addSummaryHighlight(summaryHighlights, {
      highlight,
      locationFilterId,
      pageId,
    });
  }

  dispatch(receiveSummaryHighlights(summaryHighlights));
};

export default actionHook(setSummaryFilters, hookBody);
