import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { summaryPageSize } from '../constants';
import { highlightLocationFilters, remainingSourceCounts, summaryFilters, summaryPagination } from '../selectors';
import { SummaryHighlightsPagination } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../utils';
import { getNextPageSources } from '../utils/paginationUtils';

const incrementPage = (pagination: Exclude<SummaryHighlightsPagination, null>) =>
  ({...pagination, page: pagination.page + 1});

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> = ({
  dispatch, getState, highlightClient,
}) => async() => {
  const state = getState();
  const book = bookSelector(state);
  const locationFilters = highlightLocationFilters(state);
  const previousPagination = summaryPagination(state);
  const {colors} = summaryFilters(state);

  const getNewSources = () => {
    const remainingCounts = remainingSourceCounts(state);
    return book ? getNextPageSources(remainingCounts, book.tree, summaryPageSize) : [];
  };

  const {page, sourceIds} = previousPagination
    ? incrementPage(previousPagination)
    : {sourceIds: getNewSources(), page: 1};

  if (!book || sourceIds.length === 0) {
    dispatch(receiveSummaryHighlights({}, null));
    return;
  }

  const highlights = await highlightClient.getHighlights({
    colors: colors as unknown as GetHighlightsColorsEnum[],
    page,
    perPage: summaryPageSize,
    scopeId: book.id,
    sourceIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (!highlights || !highlights.data) {
    throw new Error('response from highlights api is invalid');
  }

  const formattedHighlights = highlights.data.reduce((result, highlight) => {
    const pageId = stripIdVersion(highlight.sourceId);
    const location = assertDefined(
      getHighlightLocationFilterForPage(locationFilters, pageId),
      'highlight is not in a valid location'
    );
    const locationFilterId = stripIdVersion(location.id);

    return addSummaryHighlight(result, {
      highlight,
      locationFilterId,
      pageId,
    });
  }, {} as ReturnType<typeof addSummaryHighlight>);

  const meta = assertDefined(highlights.meta, 'response from highlights api is invalid');
  const perPage = assertDefined(meta.perPage, 'response from highlights api is invalid');
  const totalCount = assertDefined(meta.totalCount, 'response from highlights api is invalid');
  const loadedResults = (page - 1) * perPage + highlights.data.length;

  const pagination = loadedResults < totalCount
    ? {sourceIds, page}
    : null;

  dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
};

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export default actionHook(setSummaryFilters, hookBody);
