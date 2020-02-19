import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights} = await loadMore(services);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, null));

    if (myHighlightsOpen(services.getState())) {
      assertWindow().print();
    }
  };

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
