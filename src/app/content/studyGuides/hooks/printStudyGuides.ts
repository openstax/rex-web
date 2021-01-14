import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { StudyGuidesPopupPrintError } from '../../highlights/errors';
import { printStudyGuides, receiveSummaryStudyGuides, toggleStudyGuidesSummaryLoading } from '../actions';
import { studyGuidesOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

let waitingForPromiseCollector = false;

export const asyncHelper = async(services: MiddlewareAPI & AppServices) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error) {
    services.dispatch(toggleStudyGuidesSummaryLoading(false));

    // TODO: This should check for instanceof CustomApplicationError but it doesn't work in tests
    if (error.name === 'CustomApplicationError') {
      throw error;
    }

    throw new StudyGuidesPopupPrintError({ destination: 'studyGuides' });
  }

  const {formattedHighlights} = response;
  services.dispatch(receiveSummaryStudyGuides(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  if (waitingForPromiseCollector) {
    // wait for content to process/load
    await services.promiseCollector.calm();
    waitingForPromiseCollector = false;
  }

  services.dispatch(toggleStudyGuidesSummaryLoading(false));

  if (studyGuidesOpen(services.getState())) {
    assertWindow().print();
  }
};

export const hookBody: ActionHookBody<typeof printStudyGuides> = (services) => () => {
  // TODO: refactor this somehow
  // do not return promise, otherwise `services.promiseCollector.calm()` will end up waiting for itself
  waitingForPromiseCollector = true;
  return asyncHelper(services);
};

export const printStudyGuidesHook = actionHook(printStudyGuides, hookBody);
