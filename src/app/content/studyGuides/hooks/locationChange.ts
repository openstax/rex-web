import {
  GetHighlightsSetsEnum,
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { maxHighlightsApiPageSize } from '../../constants';
import { bookAndPage } from '../../selectors';
import { loadAllHighlights } from '../../utils/highlightLoadingUtils';
import { extractTotalCounts } from '../../utils/highlightSharedUtils';
import { receiveStudyGuides, receiveStudyGuidesTotalCounts } from '../actions';
import { hasStudyGuides, studyGuidesEnabled } from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book, page} = bookAndPage(state);
  const isEnabled = studyGuidesEnabled(state);
  const hasCurrentStudyGuides = hasStudyGuides(state);

  if (!isEnabled || !book || !page || hasCurrentStudyGuides) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });
  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  const totalCounts = extractTotalCounts(countsPerSource);

  services.dispatch(receiveStudyGuidesTotalCounts(totalCounts));

  const highlights = await loadAllHighlights({
    book,
    highlightClient: services.highlightClient,
    pagination: {page: 1, sourceIds: [page.id], perPage: maxHighlightsApiPageSize},
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
  });

  services.dispatch(receiveStudyGuides(highlights));
};

export default hookBody;
