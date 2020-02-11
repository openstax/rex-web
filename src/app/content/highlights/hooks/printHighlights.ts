import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights } from '../actions';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights} = await loadMore(services);
    if (Object.keys(formattedHighlights).length) {
      services.dispatch(receiveSummaryHighlights(formattedHighlights, null));
    }

    assertWindow().print();
  };

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
