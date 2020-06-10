import {
  GetHighlightsColorsEnum,
  GetHighlightsSetsEnum,
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { createSummaryHighlightsLoader } from '../../utils/sharedHighlightsUtils';
import { receiveStudyGuides, receiveStudyGuidesHighlights } from '../actions';
import * as select from '../selectors';

export const loadMoreStudyGuidesHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.highlightLocationFilters(state);
  const colors = select.summaryColorFilters(state);
  const filteredCounts = select.filteredCountsPerPage(state)

  const previousPagination = select.studyGuidesPagination(state);

  const query = {
    colors: colors as unknown as GetHighlightsColorsEnum[],
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

  const {formattedHighlights, pagination} = await loadMoreStudyGuidesHighlights(services, 20);

  services.dispatch(receiveStudyGuidesHighlights(formattedHighlights));
  services.dispatch(receiveStudyGuides(studyGuidesSummary, pagination));
};

export default hookBody;
