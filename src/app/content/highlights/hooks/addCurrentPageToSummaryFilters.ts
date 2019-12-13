import { ActionHookBody, AppServices, MiddlewareAPI,  } from '../../../types';
import { actionHook } from '../../../utils';
import { bookAndPage } from '../../selectors';
import { findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { addCurrentPageToSummaryFilters, filtersChange, setChaptersFilter } from '../actions';
import * as select from '../selectors';

const hookBody: ActionHookBody<typeof addCurrentPageToSummaryFilters> = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => async() => {
  const state = getState();
  const {book, page} = bookAndPage(state);
  const selectedChapters = select.chaptersFilter(state);
  if (!book || !page || typeof(window) === 'undefined') {
    return;
  }

  // Add current page or their parent to the chaptersFilter
  const treeNode = findArchiveTreeNode(book.tree, page.id);
  if (!treeNode) { return; }
  const nodeParent = treeNode.parent!;
  let idToAdd = stripIdVersion(nodeParent.id);
  if (!nodeParent.parent) {
    // nodeParent is a whole book
    // use current page id
    idToAdd = stripIdVersion(treeNode.id);
  }
  if (!selectedChapters.includes(idToAdd)) {
    dispatch(setChaptersFilter([...selectedChapters, idToAdd]));
    dispatch(filtersChange());
  }
};

export default actionHook(addCurrentPageToSummaryFilters, hookBody);
