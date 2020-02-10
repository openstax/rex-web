import { receiveUser } from '../../../auth/actions';
import { actionHook } from '../../../utils';
import createHighlight from './createHighlight';
import { initializeMyHighlightsSummaryHook } from './initializeMyHighlightsSummary';
import { loadMoreHook, setSummaryFiltersHook } from './loadMore';
import loadHighlights from './locationChange';
import { openMyHighlightsHook } from './openMyHighlights';
import { printHighlightsHook } from './printHighlights';
import removeHighlight from './removeHighlight';
import updateHighlight from './updateHighlight';

export { loadHighlights };

export default [
  createHighlight,
  removeHighlight,
  updateHighlight,
  initializeMyHighlightsSummaryHook,
  setSummaryFiltersHook,
  openMyHighlightsHook,
  printHighlightsHook,
  loadMoreHook,
  actionHook(receiveUser, loadHighlights),
];
