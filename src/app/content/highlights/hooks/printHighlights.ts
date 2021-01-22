import { makeApplicationError } from '../../../../helpers/applicationMessageError';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { HighlightPopupPrintError } from '../errors';
import { myHighlightsOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

let waitingForPromiseCollector = false;

export const asyncHelper = async(services: MiddlewareAPI & AppServices ) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error) {
    services.dispatch(toggleSummaryHighlightsLoading(false));
    throw makeApplicationError(error, new HighlightPopupPrintError({ destination: 'myHighlights' }));
  }

  const {formattedHighlights} = response;
  services.dispatch(receiveSummaryHighlights(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  if (waitingForPromiseCollector) {
    // wait for content to process/load
    await services.promiseCollector.calm();
    waitingForPromiseCollector = false;
  }

  services.dispatch(toggleSummaryHighlightsLoading(false));

  if (myHighlightsOpen(services.getState())) {
    assertWindow().print();
  }
};

export const hookBody: ActionHookBody<typeof printSummaryHighlights> = (services) => () => {
  waitingForPromiseCollector = true;
  return asyncHelper(services);
};

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
