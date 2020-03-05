
import { ActionHookBody } from '../../../types';
import { actionHook, assertDocument, assertWindow } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights} = await loadMore(services);

    services.dispatch(receiveSummaryHighlights(formattedHighlights, {
      isStillLoading: true,
      pagination: null,
    }));

    await allImagesLoaded(assertDocument());
    services.dispatch(toggleSummaryHighlightsLoading(false));

    if (myHighlightsOpen(services.getState())) {
      assertWindow().print();
    }
  };

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
