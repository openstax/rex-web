import { receiveUser } from '../../../auth/actions';
import { actionHook } from '../../../utils';
import createHighlight from './createHighlight';
import loadHighlights from './locationChange';
import filtersChange from './filtersChange';
import removeHighlight from './removeHighlight';
import updateHighlight from './updateHighlight';

export { loadHighlights };

export default [
  createHighlight,
  removeHighlight,
  updateHighlight,
  filtersChange,
  actionHook(receiveUser, loadHighlights),
];
