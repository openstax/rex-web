import { receiveUser } from '../../../auth/actions';
import { actionHook } from '../../../utils';
import createHighlight from './createHighlight';
import filtersChange from './filtersChange';
import loadHighlights from './locationChange';
import openMyHighlights from './openMyHighlights';
import removeHighlight from './removeHighlight';
import updateHighlight from './updateHighlight';

export { loadHighlights };

export default [
  createHighlight,
  removeHighlight,
  updateHighlight,
  filtersChange,
  openMyHighlights,
  actionHook(receiveUser, loadHighlights),
];
