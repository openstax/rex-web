import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

export const asyncHelper = async(services: MiddlewareAPI & AppServices ) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error) {
    Sentry.captureException(error);
    services.dispatch(addToast(toastMessageKeys.higlights.failure.popUp.print, {destination: 'myHighlights'}));
    services.dispatch(toggleSummaryHighlightsLoading(false));
    return;
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
