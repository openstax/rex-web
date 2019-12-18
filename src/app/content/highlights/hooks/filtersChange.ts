import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { isArchiveTree } from '../../guards';
import { book as bookSelector } from '../../selectors';
import * as archiveTreeUtils from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { addSummaryHighlight } from '../components/utils/summaryHighlightsUtils';
import { highlightLocations, summaryFilters } from '../selectors';
import { SummaryHighlights } from '../types';
import { getHighlightLocationForPage } from '../utils';

export const hookBody: ActionHookBody<typeof setSummaryFilters> = ({
  dispatch, getState, highlightClient,
}) => async() => {
  const state = getState();
  const book = bookSelector(state);
  const locations = highlightLocations(state);
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
  let sourceIds: string[] = [];

  for (const filterId of locationIds) {
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

    // LocationId can be the same as pageId for ex. for Preface
    if (locations.has(pageId)) {
      summaryHighlights = addSummaryHighlight(summaryHighlights, {
        highlight: h,
        pageId,
      });
      continue;
    }

    const page = pages.find((p) => p.id === pageId);
    const location = page && getHighlightLocationForPage(locations, page);
    const locationId = location && stripIdVersion(location.id);
    // This should probably throw some kind of error?
    if (!locationId) { continue; }

    summaryHighlights = addSummaryHighlight(summaryHighlights, {
      highlight: h,
      locationId,
      pageId,
    });
  }

  dispatch(receiveSummaryHighlights(summaryHighlights));
};

export default actionHook(setSummaryFilters, hookBody);
