import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { user } from '../../../auth/selectors';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { filtersChange, receiveHighlights, setChaptersFilter } from '../actions';
import * as select from '../selectors';

const hookBody = ({dispatch, getState, highlightClient}: MiddlewareAPI & AppServices) => async() => {
  const state = getState();
  const {book, page} = bookAndPage(state);
  const selectedChapters = select.chaptersFilter(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);

  if (!authenticated || !book || !page || typeof(window) === 'undefined' || loaded) {
    return;
  }

  const highlights = await highlightClient.getHighlights({
    perPage: 100,
    scopeId: book.id,
    sourceIds: [page.id],
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }

  // Add current page or their parent to the chaptersFilter for summary highlights
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

export default hookBody;
