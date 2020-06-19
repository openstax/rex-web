import {
  GetHighlightsColorsEnum, GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { formatReceivedHighlights, loadUntilPageSize } from '../../highlights/utils/highlightLoadingUtils';
import { book as bookSelector } from '../../selectors';
import { loadMoreStudyGuides, receiveSummaryStudyGuides } from '../actions';
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

export const hookBody: ActionHookBody<typeof loadMoreStudyGuides> = (services) => async() => {
  const {formattedHighlights, pagination} = await loadMore(services, summaryPageSize);
  services.dispatch(receiveSummaryStudyGuides(formattedHighlights, pagination));
};

export const loadMoreHook = actionHook(loadMoreStudyGuides, hookBody);
