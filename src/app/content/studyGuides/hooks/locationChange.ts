import {
  GetHighlightsColorsEnum,
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
  GetHighlightsSetsEnum
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { bookAndPage, highlightLocationFilters } from '../../selectors';
import { formatReceivedHighlights, loadUntilPageSize } from '../../utils/highlightLoadingUtils';
import { extractTotalCounts } from '../../utils/highlightSharedUtils';
import { receiveStudyGuidesTotalCounts, receiveSummaryStudyGuides } from '../actions';
import { allColors } from '../constants';
import * as select from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book, page} = bookAndPage(state);
  const isEnabled = select.studyGuidesEnabled(state);
  const hasCurrentStudyGuides = select.hasStudyGuides(state);
  const locationFilters = highlightLocationFilters(state);

  if (!isEnabled || !book || !page || hasCurrentStudyGuides) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });
  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  const totalCounts = extractTotalCounts(countsPerSource);

  services.dispatch(receiveStudyGuidesTotalCounts(totalCounts));

  const {highlights, pagination} = await loadUntilPageSize({
    book,
    colors: allColors as unknown as GetHighlightsColorsEnum[],
    countsPerSource: totalCounts,
    highlightClient: services.highlightClient,
    pageSize: summaryPageSize,
    previousPagination: null,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
    sourcesFetched: [],
  });

  services.dispatch(receiveSummaryStudyGuides(formatReceivedHighlights(highlights, locationFilters), pagination));
};

export default hookBody;
