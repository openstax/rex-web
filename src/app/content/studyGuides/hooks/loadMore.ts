import {
  GetHighlightsColorsEnum,
  GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { highlightLocationFilters } from '../../selectors';
import { createSummaryHighlightsLoader } from '../../utils/sharedHighlightsUtils';
import { loadMoreStudyGuides, receiveStudyGuidesSummary } from '../actions';
import * as select from '../selectors';

export const loadMoreStudyGuidesHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = highlightLocationFilters(state);
  const colors = select.summaryColorFilters(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const filteredCounts = select.filteredCountsPerPage(state);
  const previousPagination = select.studyGuidesPagination(state);

  const query = {
    colors: [...colors] as unknown as GetHighlightsColorsEnum[],
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
  };

  const loadMore = createSummaryHighlightsLoader({
    countsPerSource: filteredCounts,
    locationFilters,
    previousPagination,
    query,
    sourcesFetched,
  });

  return loadMore(services, pageSize);
};

const hookBody: ActionHookBody<typeof loadMoreStudyGuides> = (services) => async() => {
  const {formattedHighlights, pagination} = await loadMoreStudyGuidesHighlights(services, summaryPageSize);
  services.dispatch(receiveStudyGuidesSummary(formattedHighlights, pagination));
};

export const loadMoreHook = actionHook(loadMoreStudyGuides, hookBody);
