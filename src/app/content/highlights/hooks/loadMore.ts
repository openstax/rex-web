import { GetHighlightsColorsEnum } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { book as bookSelector } from '../../selectors';
import {
  loadMoreSummaryHighlights,
  receiveSummaryHighlights,
  setSummaryFilters,
  toggleSummaryHighlightsLoading
} from '../actions';
import * as select from '../selectors';
import { formatReceivedHighlights, loadUntilPageSize } from '../utils/highlightLoadingUtils';

export const loadMore = async(services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.highlightLocationFilters(state);
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
    const filters = select.summaryFilters(services.getState());
    try {
      const {formattedHighlights, pagination} = await loadMore(services, summaryPageSize);
      services.dispatch(receiveSummaryHighlights(formattedHighlights, {pagination, filters}));
    } catch (error) {
      Sentry.captureException(error);
      services.dispatch(addToast('i18n:notification:toast:highlights:load-failure'));
      services.dispatch(toggleSummaryHighlightsLoading(false));
    }
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
