import { assertDefined } from '../../utils';
import { Book, Page } from '../types';
import {
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  getArchiveTreeSectionNumber,
  splitTitleParts,
} from './archiveTreeUtils';

export const createTitle = (page: Page, book: Book): string => {
  let node = assertDefined(findArchiveTreeNode(book.tree, page.id), `couldn't find node for a page id: ${page.id}`);
  const [nodeNumber, nodeTitle] = splitTitleParts(node.title);
  const title = `${nodeTitle} - ${book.title} | OpenStax`;
  if (nodeNumber) { return title; }
  while (node && node.parent) {
    node = node.parent;
    if (archiveTreeSectionIsChapter(node)) {
      const number = getArchiveTreeSectionNumber(node);
      return `Ch. ${number} ` + title;
    }
  }
  return title;
};
