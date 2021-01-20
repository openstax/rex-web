import {
  GetHighlightsColorsEnum, GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, CustomApplicationError } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { StudyGuidesPopupLoadError } from '../../highlights/errors';
import { formatReceivedHighlights, loadUntilPageSize } from '../../highlights/utils/highlightLoadingUtils';
import { book as bookSelector } from '../../selectors';
import * as actions from '../actions';
import * as select from '../selectors';

export const loadMore = async(services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.studyGuidesLocationFilters(state);
  const colorFilters = select.summaryColorFilters(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const filteredCounts = select.filteredCountsPerPage(state);
  const previousPagination = select.summaryStudyGuidesPagination(state);
  const book = bookSelector(state);

  const {highlights, pagination} = await loadUntilPageSize({
    book,
    colors: [...colorFilters] as unknown as GetHighlightsColorsEnum[],
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
export type LoadMoreResponse = ReturnType<typeof loadMore>;

export const hookBody: ActionHookBody<
  typeof actions.setDefaultSummaryFilters |
  typeof actions.setSummaryFilters |
  typeof actions.updateSummaryFilters |
  typeof actions.loadMoreStudyGuides
> = (services) => async() => {
  const filters = select.summaryFilters(services.getState());

  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services, summaryPageSize);
  } catch (error) {
    services.dispatch(actions.toggleStudyGuidesSummaryLoading(false));

    if (error instanceof CustomApplicationError) {
      throw error;
    }

    throw new StudyGuidesPopupLoadError({ destination: 'studyGuides' });
  }

  const {formattedHighlights, pagination} = response;
  services.dispatch(actions.receiveSummaryStudyGuides(formattedHighlights, {pagination, filters}));
};

export const loadMoreHook = actionHook(actions.loadMoreStudyGuides, hookBody);
export const setSummaryFiltersHook = actionHook(actions.setSummaryFilters, hookBody);
export const updateSummaryFiltersHook = actionHook(actions.updateSummaryFilters, hookBody);
export const setDefaultSummaryFiltersHook = actionHook(actions.setDefaultSummaryFilters, hookBody);
