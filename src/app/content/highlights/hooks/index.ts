import { receiveUser } from '../../../auth/actions';
import { actionHook } from '../../../utils';
import createHighlight from './createHighlight';
import { loadMoreHook, setSummaryFiltersHook } from './loadMore';
import loadHighlights from './locationChange';
import openMyHighlights from './openMyHighlights';
import removeHighlight from './removeHighlight';
import updateHighlight from './updateHighlight';

export { loadHighlights };

export default [
  createHighlight,
  removeHighlight,
  updateHighlight,
  setSummaryFiltersHook,
  loadMoreHook,
  openMyHighlights,
  actionHook(receiveUser, loadHighlights),
];
