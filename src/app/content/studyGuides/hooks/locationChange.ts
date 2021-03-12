import {
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { StudyGuidesLoadError } from '../../highlights/errors';
import { extractTotalCounts } from '../../highlights/utils/paginationUtils';
import { bookAndPage } from '../../selectors';
import { receiveStudyGuidesTotalCounts } from '../actions';
import { hasStudyGuides, studyGuidesEnabled } from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const loadSummary = async(services: MiddlewareAPI & AppServices) => {
  const {getState, highlightClient} = services;

  const state = getState();

  const {book} = bookAndPage(state);
  const isEnabled = studyGuidesEnabled(state);
  const hasCurrentStudyGuides = hasStudyGuides(state);

  if (!isEnabled || !book || hasCurrentStudyGuides) { return; }

  try {
    const summary = await highlightClient.getHighlightsSummary({
      scopeId: book.id,
      sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
      sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
    });

    return summary;
  } catch (error) {
    throw ensureApplicationErrorType(
      error,
      new StudyGuidesLoadError({ destination: 'page', shouldAutoDismiss: false }));
  }
};

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const studyGuidesSummary = await loadSummary(services);

  if (!studyGuidesSummary) { return; }

  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  const totalCounts = extractTotalCounts(countsPerSource);

  services.dispatch(receiveStudyGuidesTotalCounts(totalCounts));
};

export default hookBody;
