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
  const {dispatch, getState, highlightClient} = services;

  const state = getState();

  const {book, page} = bookAndPage(state);
  const isEnabled = studyGuidesEnabled(state);
  const hasCurrentStudyGuides = hasStudyGuides(state);

  if (!isEnabled || !book || !page || hasCurrentStudyGuides) { return; }

  let studyGuidesSummary: HighlightsSummary | undefined;
  try {
    studyGuidesSummary = await highlightClient.getHighlightsSummary({
      scopeId: book.id,
      sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
      sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
    });
  } catch (error) {
    Sentry.captureException(error);
    dispatch(addToast({messageKey: 'i18n:notification:toast:study-guides:load-failure', shouldAutoDismiss: false}));
  }
  if (!studyGuidesSummary) { return; }

  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  const totalCounts = extractTotalCounts(countsPerSource);

  dispatch(receiveStudyGuidesTotalCounts(totalCounts));
};

export default hookBody;
