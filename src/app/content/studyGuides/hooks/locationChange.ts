import {
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { extractTotalCounts } from '../../highlights/utils/paginationUtils';
import { bookAndPage } from '../../selectors';
import { receiveStudyGuidesTotalCounts } from '../actions';
import { hasStudyGuides, studyGuidesEnabled } from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const loadSummary = async(services: MiddlewareAPI & AppServices) => {
  const {dispatch, getState, highlightClient} = services;

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
    const errorId = Sentry.captureException(error);
    dispatch(
      addToast(toastMessageKeys.studyGuides.failure.load, {destination: 'page', shouldAutoDismiss: false, errorId}));
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
