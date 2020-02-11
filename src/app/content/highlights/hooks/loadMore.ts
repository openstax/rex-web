import { GetHighlightsColorsEnum, Highlight } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, Store } from '../../../types';
import { actionHook } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { summaryPageSize } from '../constants';
import * as select from '../selectors';
import { SummaryHighlightsPagination } from '../types';
import { getNewSources } from './utils';
import { fetchHighlightsForSource, incrementPage, loadMoreByFunction } from './utils';

export const loadUntilPageSize = async({
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
  const {colors} = select.summaryFilters(state);
  const {page, sourceIds} = previousPagination
    ? incrementPage(previousPagination)
    : {sourceIds: getNewSources(state, args.sourcesFetched, summaryPageSize), page: 1};

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book,
    colors: colors as unknown as GetHighlightsColorsEnum[],
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds},
    perFetch: summaryPageSize,
    prevHighlights: args.highlights,
  });

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

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights, pagination} = await loadMoreByFunction(loadUntilPageSize, services);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
