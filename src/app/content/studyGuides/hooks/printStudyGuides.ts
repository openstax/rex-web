import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { StudyGuidesPopupPrintError } from '../../highlights/errors';
import { printStudyGuides, receiveSummaryStudyGuides, toggleStudyGuidesSummaryLoading } from '../actions';
import { studyGuidesOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

export const asyncHelper = async(services: MiddlewareAPI & AppServices) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error: unknown) {
    services.dispatch(toggleStudyGuidesSummaryLoading(false));
    throw ensureApplicationErrorType(error, new StudyGuidesPopupPrintError({ destination: 'studyGuides' }));
  }

  const {formattedHighlights} = response;
  services.dispatch(receiveSummaryStudyGuides(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  // wait for content to process/load
  services.promiseCollector.calm()
    .then(() => {
      services.dispatch(toggleStudyGuidesSummaryLoading(false));

      if (studyGuidesOpen(services.getState())) {
        assertWindow().print();
      }
    });
};

export const hookBody: ActionHookBody<typeof printStudyGuides> = (services) => () => {
  return asyncHelper(services);
};

export const printStudyGuidesHook = actionHook(printStudyGuides, hookBody);
