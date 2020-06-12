import {
  GetHighlightsColorsEnum,
  GetHighlightsSetsEnum,
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { bookAndPage } from '../../selectors';
import { highlightLocationFilters } from '../../selectors'
import { createSummaryHighlightsLoader, extractTotalCounts } from '../../utils/sharedHighlightsUtils';
import { receiveHighlightsTotalCounts, receiveStudyGuidesSummaryHighlights } from '../actions';
import * as select from '../selectors';

export const loadMoreStudyGuidesHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = highlightLocationFilters(state);
  const colors = select.summaryColorFilters(state);
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
    sourcesFetched: [],
  });

  return loadMore(services, pageSize);
};

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book} = bookAndPage(state);
  const isEnabled = select.studyGuidesEnabled(state);
  const hasCurrentSummary = select.hasStudyGuides(state);

  if (!isEnabled || !book || hasCurrentSummary) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  services.dispatch(receiveHighlightsTotalCounts(extractTotalCounts(countsPerSource)));

  const {formattedHighlights, pagination} = await loadMoreStudyGuidesHighlights(services, 10);
  services.dispatch(receiveStudyGuidesSummaryHighlights(formattedHighlights, pagination));
  // services.dispatch(receiveStudyGuides(studyGuidesSummary, pagination));
};

export default hookBody;
