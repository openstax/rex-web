import {
  GetHighlightsColorsEnum, GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
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
  typeof actions.loadMoreStudyGuides
> = (services) => async() => {
  const filters = select.summaryFilters(services.getState());

  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services, summaryPageSize);
  } catch (error) {
    const errorId = Sentry.captureException(error);
    services.dispatch(
      addToast(toastMessageKeys.studyGuides.failure.popUp.load, {destination: 'studyGuides', errorId}));
    services.dispatch(actions.toggleStudyGuidesSummaryLoading(false));
    return;
  }

  const {formattedHighlights, pagination} = response;
  services.dispatch(actions.receiveSummaryStudyGuides(formattedHighlights, {pagination, filters}));
};

export const loadMoreHook = actionHook(actions.loadMoreStudyGuides, hookBody);
export const setSummaryFiltersHook = actionHook(actions.setSummaryFilters, hookBody);
export const setDefaultSummaryFiltersHook = actionHook(actions.setDefaultSummaryFilters, hookBody);
