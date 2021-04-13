import { AppServices } from '../../types';
import getCleanContent from '../utils/getCleanContent';
import { assertDefined } from '../../utils';
import { Book, LinkedArchiveTree, LinkedArchiveTreeNode, LinkedArchiveTreeSection, Page } from '../types';
import { HTMLElement, Element } from '@openstax/types/lib.dom';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  findArchiveTreeNodeById,
  getArchiveTreeSectionNumber,
  getArchiveTreeSectionTitle,
  splitTitleParts,
} from './archiveTreeUtils';

const domParser = new DOMParser();

const getParentPrefix = (node: LinkedArchiveTreeNode | undefined): string => {
  if (!node) {
    return '';
  }

  if (archiveTreeSectionIsChapter(node)) {
    const number = getArchiveTreeSectionNumber(node);
    return `Ch. ${number} `;
  }

  return archiveTreeSectionIsBook(node.parent)
    ? getArchiveTreeSectionTitle(node) + ' '
    : getParentPrefix(node.parent);

};

const hideMath = (node: HTMLElement) => {
  const mathSpans = node.querySelectorAll('.os-math-in-para');
  mathSpans.forEach((el: Element) => {
    el.outerHTML = '...';
  });
  return node;
};

const getPageType = (node: HTMLElement) => {
  if (!node) {
    return '';
  }

  if (node.classList.contains('appendix')) {
    return 'appendix';
  } else if (
      node.classList.contains('os-solution-container')
      || node.classList.contains('os-solutions-container')
      ) {
    return 'answer-key';
  } else {
    return node.getAttribute('data-type');
  }
};

const getChapterNum = (section: LinkedArchiveTreeSection | LinkedArchiveTree) => {
  const nodeTitleDoc = domParser.parseFromString(section.title, 'text/html');
  const titleNode = nodeTitleDoc.body.children[0];
  const titleNodeNum = titleNode.innerText ? parseInt(titleNode.innerText.split('.')[0], 10) : 0 ;
  const prefix = getParentPrefix(section.parent);
  const prefixNum = parseInt(prefix.trim().split(' ')[1], 10);

  // Check for numbers indicating chapter first in title node and then prefix.
  return !isNaN(titleNodeNum) ? titleNodeNum : (!isNaN(prefixNum) ? prefixNum : '');
};

export const createDescription = (loader: AppServices['archiveLoader'], book: Book, page: Page) => {
  const cleanContent = getCleanContent(book, page, loader);
  const doc = domParser.parseFromString(cleanContent, 'text/html');
  const contentNode = doc.body.children[0];
  const pageType = getPageType(contentNode);
  const node = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );
  const sectionTitle = getArchiveTreeSectionTitle(node);
  const chapterNum = getChapterNum(node);

  if (pageType === 'page') {
    // Remove abstract if it exists.
    if (contentNode.querySelector('[data-type="abstract"]')) {
      contentNode.querySelector('[data-type="abstract"]').remove();
    }
    const mathless = hideMath(contentNode.querySelector('p'));
    return mathless.textContent ? mathless.textContent.trim().substring(0, 155) : '';
  } else {
    const descriptionPhrase = pageType === 'answer-key' ? `the Answer Key for ${sectionTitle} of` : (chapterNum
      ? `${sectionTitle} for Chapter ${chapterNum} of`
      : `${sectionTitle} for`);
    return `On this page you will discover ${descriptionPhrase} OpenStax's ${book.title} free college textbook.`;
  }
};

export const createTitle = (page: Page, book: Book): string => {
  const node = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );
  const [nodeNumber, nodeTitle] = splitTitleParts(node.title);
  const title = `${nodeTitle} - ${book.title} | OpenStax`;

  if (nodeNumber) {
    return `${nodeNumber} ${title}`;
  }

  return getParentPrefix(node.parent) + title;
};
