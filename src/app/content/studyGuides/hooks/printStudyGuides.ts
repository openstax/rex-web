import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printStudyGuides, receiveSummaryStudyGuides, toggleStudyGuidesSummaryLoading } from '../actions';
import { studyGuidesOpen } from '../selectors';
import { loadMore } from './loadMore';

export const asyncHelper = async(services: MiddlewareAPI & AppServices) => {
  const {formattedHighlights} = await loadMore(services);
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
