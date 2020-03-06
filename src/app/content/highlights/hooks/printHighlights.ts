import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof printSummaryHighlights> = (services) => () => {

  const asyncHelper = async() => {
    const {formattedHighlights} = await loadMore(services);
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

  // do not return promise, otherwise `services.promiseCollector.calm()` will end up waiting for itself
  asyncHelper();
};

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
