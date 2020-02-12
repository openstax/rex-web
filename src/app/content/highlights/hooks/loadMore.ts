import { GetHighlightsColorsEnum, GetHighlightsSourceTypeEnum, Highlight } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { ActionHookBody, AppServices, AppState, MiddlewareAPI, Store } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { summaryPageSize } from '../constants';
import * as select from '../selectors';
import { SummaryHighlightsPagination } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../utils';
import { getNextPageSources } from '../utils/paginationUtils';

const incrementPage = (pagination: NonNullable<SummaryHighlightsPagination>) =>
  ({...pagination, page: pagination.page + 1});

const getNewSources = (state: AppState, omitSources: string[]) => {
  const book = bookSelector(state);
  const remainingCounts = omit(omitSources, select.filteredCountsPerPage(state));
  return book ? getNextPageSources(remainingCounts, book.tree, summaryPageSize) : [];
};

const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[]
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);
  const colors = select.summaryColorFilters(state);
  const {page, sourceIds} = previousPagination
    ? incrementPage(previousPagination)
    : {sourceIds: getNewSources(state, args.sourcesFetched), page: 1};

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const highlightsResponse = await args.highlightClient.getHighlights({
    colors: [...colors] as unknown as GetHighlightsColorsEnum[],
    page,
    perPage: summaryPageSize,
    scopeId: book.id,
    sourceIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  // TODO - change swagger so none of this is nullable
  const data = assertDefined(highlightsResponse.data, 'response from highlights api is invalid');
  const meta = assertDefined(highlightsResponse.meta, 'response from highlights api is invalid');
  const perPage = assertDefined(meta.perPage, 'response from highlights api is invalid');
  const totalCount = assertDefined(meta.totalCount, 'response from highlights api is invalid');

  const loadedResults = (page - 1) * perPage + data.length;
  const pagination = loadedResults < totalCount
    ? {sourceIds, page}
    : null;

  const highlights = args.highlights
    ? [...args.highlights, ...data]
    : data
  ;

  if (highlights.length < summaryPageSize) {
    return loadUntilPageSize({
      ...args,
      highlights,
      previousPagination: pagination,
      sourcesFetched: [...args.sourcesFetched, ...sourceIds],
    });
  }

  return {pagination, highlights};
};

const loadMore = async({getState, highlightClient, dispatch}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));

  const {pagination, highlights} = await loadUntilPageSize({
    getState,
    highlightClient,
    previousPagination,
    sourcesFetched,
  });

  const formattedHighlights = highlights.reduce((result, highlight) => {
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

  dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
};

export default loadMore;

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => () => loadMore(services);

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
