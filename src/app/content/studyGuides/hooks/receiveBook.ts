import { GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { receiveBook } from '../../actions';
import { receiveStudyGuides } from '../actions';

export const hookBody: ActionHookBody<typeof receiveBook> = (
  services: MiddlewareAPI & AppServices
) => async(action) => {
  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: action.payload.id,
    sets: ['curated:openstax'],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  } as any);
  // TODO: Remove this as any and update highlightClient to the newer version

  services.dispatch(receiveStudyGuides(studyGuidesSummary));
};

export default actionHook(receiveBook, hookBody);
