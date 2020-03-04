import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => () => {
    loadMore(services).then(({formattedHighlights}) => {
      services.dispatch(receiveSummaryHighlights(formattedHighlights, {
        isStillLoading: true,
        pagination: null,
      }));

      services.promiseCollector.calm().then(() => {
        services.dispatch(toggleSummaryHighlightsLoading(false));

        if (myHighlightsOpen(services.getState())) {
          assertWindow().print();
        }
      });
    });
  };

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
