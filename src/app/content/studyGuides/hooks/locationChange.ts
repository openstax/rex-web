import { GetHighlightsSummarySetsEnum, GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { receiveStudyGuides } from '../actions';
import { studyGuidesEnabled, studyGuidesSummaryIsNotEmpty } from '../selectors';

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book} = bookAndPage(state);
  const isEnabled = studyGuidesEnabled(state);
  const hasCurrentSummary = studyGuidesSummaryIsNotEmpty(state);

  if (!isEnabled || !book || hasCurrentSummary) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  services.dispatch(receiveStudyGuides(studyGuidesSummary));
};

export default hookBody;
