import { ActionHookBody, AppServices, MiddlewareAPI,  } from '../../../types';
import { actionHook } from '../../../utils';
import { bookAndPage } from '../../selectors';
import { findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { addCurrentPageToSummaryFilters, setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof addCurrentPageToSummaryFilters> = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => async() => {
  const state = getState();
  const {book, page} = bookAndPage(state);
  const filters = select.summaryFilters(state);
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
  if (!filters.chapters.includes(idToAdd)) {
    dispatch(setSummaryFilters({
      ...filters,
      chapters: [...filters.chapters, idToAdd],
    }));
  }
};

export default actionHook(addCurrentPageToSummaryFilters, hookBody);
