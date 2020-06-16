import { GetHighlightsColorsEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import {
  book as bookSelector,
  highlightLocationFilters
} from '../../selectors';
import {  } from '../../selectors';
import { formatReceivedHighlights, loadUntilPageSize } from '../../utils/highlightLoadingUtils';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const loadMoreMyHighlights = async(services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = highlightLocationFilters(state);
  const book = bookSelector(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const colors = select.summaryColorFilters(state);
  const filteredCounts = select.filteredCountsPerPage(state);

  const { highlights, pagination } = await loadUntilPageSize({
    book,
    colors: [...colors] as unknown as GetHighlightsColorsEnum[],
    countsPerSource: filteredCounts,
    highlightClient: services.highlightClient,
    pageSize,
    previousPagination,
    sourcesFetched,
  });

  return {
    formattedHighlights: formatReceivedHighlights(highlights, locationFilters),
    pagination,
  };
};

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights, pagination} = await loadMoreMyHighlights(services, summaryPageSize);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, {pagination}));
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
