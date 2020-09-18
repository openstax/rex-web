import {
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { extractTotalCounts } from '../../highlights/utils/paginationUtils';
import { bookAndPage } from '../../selectors';
import { receiveStudyGuidesTotalCounts } from '../actions';
import { hasStudyGuides, studyGuidesEnabled } from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book} = bookAndPage(state);
  const isEnabled = studyGuidesEnabled(state);
  const hasCurrentStudyGuides = hasStudyGuides(state);

  if (!isEnabled || !book || hasCurrentStudyGuides) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  const totalCounts = extractTotalCounts(countsPerSource);

  services.dispatch(receiveStudyGuidesTotalCounts(totalCounts));
};

export default hookBody;
