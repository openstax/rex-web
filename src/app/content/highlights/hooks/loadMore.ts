import { GetHighlightsColorsEnum, Highlight } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI, Store } from '../../../types';
import { actionHook } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { maxHighlightsPerPage, summaryPageSize } from '../constants';
import * as select from '../selectors';
import { SummaryHighlightsPagination } from '../types';
import {
  fetchHighlightsForSource,
  formatReceivedHighlights,
  getNewSources,
  incrementPage,
} from './utils';

export const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination, getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[],
  pageSize?: number,
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);
  const {colors} = select.summaryFilters(state);
  const {page, sourceIds, perPage} = previousPagination
    ? incrementPage(previousPagination)
    : {
      page: 1,
      perPage: args.pageSize || maxHighlightsPerPage,
      sourceIds: getNewSources(state, args.sourcesFetched, args.pageSize),
    };

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book,
    colors: colors as unknown as GetHighlightsColorsEnum[],
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds, perPage},
    prevHighlights: args.highlights,
  });

  if (highlights.length < summaryPageSize || !args.pageSize) {
    return loadUntilPageSize({
      ...args,
      highlights,
      previousPagination: pagination,
      sourcesFetched: [...args.sourcesFetched, ...sourceIds],
    });
  }

  return {pagination, highlights};
};

export const loadMore = async({getState, highlightClient}: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = getState();
  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));

  const {pagination, highlights} = await loadUntilPageSize({
    getState,
    highlightClient,
    pageSize,
    previousPagination,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  return {formattedHighlights, pagination};
};

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights, pagination} = await loadMore(services, summaryPageSize);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
