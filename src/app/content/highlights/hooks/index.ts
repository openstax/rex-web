import { receivePageFocus } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { actionHook } from '../../../utils';
import { closeMyHighlightsHook } from './closeMyHighlights';
import createHighlight from './createHighlight';
import { initializeMyHighlightsSummaryHook } from './initializeMyHighlightsSummary';
import { loadMoreHook, setSummaryFiltersHook } from './loadMore';
import { loadHighlights, syncModalWithUrlHook } from './locationChange';
import { openMyHighlightsHook } from './openMyHighlights';
import { printHighlightsHook } from './printHighlights';
import receiveDeleteHighlight from './receiveDeleteHighlight';
import requestDeleteHighlight from './requestDeleteHighlight';
import updateHighlight from './updateHighlight';

export { loadHighlights };

export default [
  createHighlight,
  receiveDeleteHighlight,
  requestDeleteHighlight,
  updateHighlight,
  initializeMyHighlightsSummaryHook,
  setSummaryFiltersHook,
  openMyHighlightsHook,
  closeMyHighlightsHook,
  syncModalWithUrlHook,
  printHighlightsHook,
  loadMoreHook,
  actionHook(receiveUser, loadHighlights),
  actionHook(receivePageFocus, loadHighlights),
];
