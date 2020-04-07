import { assertDefined } from '../../utils';
import { Book, Page } from '../types';
import {
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  getArchiveTreeNodeTitle,
  getArchiveTreeSectionNumber,
} from './archiveTreeUtils';

export const createTitle = (page: Page, book: Book): string => {
  let node = assertDefined(findArchiveTreeNode(book.tree, page.id), `couldn't find node for a page id: ${page.id}`);
  const nodeTitle = getArchiveTreeNodeTitle(node);
  const title = `${nodeTitle} - ${book.title} | OpenStax`;
  while (node && node.parent) {
    node = node.parent;
    if (archiveTreeSectionIsChapter(node)) {
      const number = getArchiveTreeSectionNumber(node);
      return `Ch. ${number} ` + title;
    }
  }
  return title;
};
