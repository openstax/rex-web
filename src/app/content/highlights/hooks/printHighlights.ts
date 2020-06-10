import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMoreMyHighlights } from './loadMore';

export const asyncHelper = async(services: MiddlewareAPI & AppServices ) => {
  const {formattedHighlights} = await loadMoreMyHighlights(services);
  services.dispatch(receiveSummaryHighlights(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  // wait for content to process/load
  await services.promiseCollector.calm();

  services.dispatch(toggleSummaryHighlightsLoading(false));

  if (myHighlightsOpen(services.getState())) {
    assertWindow().print();
  }
};

export const hookBody: ActionHookBody<typeof printSummaryHighlights> = (services) => () => {
  // do not return promise, otherwise `services.promiseCollector.calm()` will end up waiting for itself
  asyncHelper(services);
};

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
