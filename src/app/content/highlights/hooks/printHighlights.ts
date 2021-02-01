import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
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
    throw ensureApplicationErrorType(error, new HighlightPopupPrintError({ destination: 'myHighlights' }));
  }

  const {formattedHighlights} = response;
  services.dispatch(receiveSummaryHighlights(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  // wait for content to process/load
  services.promiseCollector.calm()
    .then(() => {
      services.dispatch(toggleSummaryHighlightsLoading(false));

      if (myHighlightsOpen(services.getState())) {
        assertWindow().print();
      }
    });
};

export const hookBody: ActionHookBody<typeof printSummaryHighlights> = (services) => () => {
  return asyncHelper(services);
};

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
