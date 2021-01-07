import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow, CustomApplicationError } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { HighlightPopupPrintError } from '../errors';
import { myHighlightsOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

export const asyncHelper = async(services: MiddlewareAPI & AppServices ) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error) {
    services.dispatch(toggleSummaryHighlightsLoading(false));

    if (error instanceof CustomApplicationError) {
      throw error;
    }

    // TODO: It seems to not be catched by makeCatchError
    throw new HighlightPopupPrintError({ destination: 'myHighlights' });
  }

  const {formattedHighlights} = response;
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
