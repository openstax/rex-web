import { assertDefined } from '../../utils';
import { Book, Page } from '../types';
import { archiveTreeSectionIsChapter, findArchiveTreeNode, getArchiveTreeSectionNumber } from './archiveTreeUtils';

export const createTitle = (page: Page, book: Book): string => {
  let node = assertDefined(findArchiveTreeNode(book.tree, page.id), `couldn't find node for a page id: ${page.id}`);
  const domNode = new DOMParser().parseFromString(node.title, 'text/html');
  const osText = domNode.querySelector('.os-text');
  const nodeTitle = osText ? osText.textContent : page.title;
  let title = `${nodeTitle} - ${book.title} | OpenStax`;
  while (node && node.parent) {
    node = node.parent;
    if (archiveTreeSectionIsChapter(node)) {
      const number = getArchiveTreeSectionNumber(node);
      title = `Ch. ${number} ` + title;
      break;
    }
  }
  return title;
};
