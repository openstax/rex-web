import {
  GetHighlightsColorsEnum, GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { formatReceivedHighlights, loadUntilPageSize } from '../../highlights/utils/highlightLoadingUtils';
import { book as bookSelector } from '../../selectors';
import * as actions from '../actions';
import { allColors } from '../constants';
import * as select from '../selectors';

export const loadMore = async(services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.studyGuidesLocationFilters(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const filteredCounts = select.filteredCountsPerPage(state);
  const previousPagination = select.summaryStudyGuidesPagination(state);
  const book = bookSelector(state);

  const {highlights, pagination} = await loadUntilPageSize({
    book,
    colors: allColors as unknown as GetHighlightsColorsEnum[],
    countsPerSource: filteredCounts,
    highlightClient: services.highlightClient,
    pageSize,
    previousPagination,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
    sourcesFetched,
  });

  return {
    formattedHighlights: formatReceivedHighlights(highlights, locationFilters),
    pagination,
  };
};

export const hookBody: ActionHookBody<
  typeof actions.setDefaultSummaryFilters |
  typeof actions.setSummaryFilters |
  typeof actions.loadMoreStudyGuides
> =
  (services) => async() => {
    const filters = select.summaryFilters(services.getState());
    const {formattedHighlights, pagination} = await loadMore(services, summaryPageSize);
    services.dispatch(actions.receiveSummaryStudyGuides(formattedHighlights, {pagination, filters}));
  };

export const loadMoreHook = actionHook(actions.loadMoreStudyGuides, hookBody);
export const setSummaryFiltersHook = actionHook(actions.setSummaryFilters, hookBody);
export const setDefaultSummaryFiltersHook = actionHook(actions.setDefaultSummaryFilters, hookBody);
