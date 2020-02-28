import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { myHighlightsOpen } from '../selectors';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => async({payload}) => {
    const {formattedHighlights} = await loadMore(services);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, {
      isStillLoading: true,
      pagination: null,
    }));

    if (payload.containerRef.current) {
      await allImagesLoaded(payload.containerRef.current);
    }

    services.dispatch(toggleSummaryHighlightsLoading(false));

    if (myHighlightsOpen(services.getState())) {
      assertWindow().print();
    }
  };

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
