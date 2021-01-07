import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow, CustomApplicationError } from '../../../utils';
import { StudyGuidesPopupPrintError } from '../../highlights/errors';
import { printStudyGuides, receiveSummaryStudyGuides, toggleStudyGuidesSummaryLoading } from '../actions';
import { studyGuidesOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

export const asyncHelper = async(services: MiddlewareAPI & AppServices) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error) {
    services.dispatch(toggleStudyGuidesSummaryLoading(false));

    if (error instanceof CustomApplicationError) {
      throw error;
    }

    // TODO: It seems to not be catched by makeCatchError
    throw new StudyGuidesPopupPrintError({ destination: 'studyGuides' });
  }

  const {formattedHighlights} = response;
  services.dispatch(receiveSummaryStudyGuides(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  // wait for content to process/load
  await services.promiseCollector.calm();

  services.dispatch(toggleStudyGuidesSummaryLoading(false));

  if (studyGuidesOpen(services.getState())) {
    assertWindow().print();
  }
};

export const hookBody: ActionHookBody<typeof printStudyGuides> = (services) => () => {
  // do not return promise, otherwise `services.promiseCollector.calm()` will end up waiting for itself
  asyncHelper(services);
};

export const printStudyGuidesHook = actionHook(printStudyGuides, hookBody);
