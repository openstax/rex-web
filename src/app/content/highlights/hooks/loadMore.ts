import { GetHighlightsColorsEnum, GetHighlightsSetsEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { createSummaryHighlightsLoader } from '../../utils/sharedSummaryHighlightsUtils';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const loadMoreMyHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const colors = select.summaryColorFilters(state);

  const query = {
    colors: [...colors] as unknown as GetHighlightsColorsEnum[] ,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
  };

  const loadMore = createSummaryHighlightsLoader({
    locationFilters,
    previousPagination,
    query,
    sourcesFetched,
  });

  return loadMore(services, pageSize);
};

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights, pagination} = await loadMoreMyHighlights(services, summaryPageSize);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, {pagination}));
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
