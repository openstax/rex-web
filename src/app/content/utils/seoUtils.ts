import { Element, HTMLElement } from '@openstax/types/lib.dom';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { Book, LinkedArchiveTreeNode, Page } from '../types';
import getCleanContent from '../utils/getCleanContent';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  findArchiveTreeNodeById,
  getArchiveTreeSectionNumber,
  getArchiveTreeSectionTitle,
  splitTitleParts,
} from './archiveTreeUtils';

const domParser = new DOMParser();

export const getParentPrefix = (node: LinkedArchiveTreeNode | undefined): string => {
  if (!node) {
    return '';
  }

  if (archiveTreeSectionIsChapter(node)) {
    const number = getArchiveTreeSectionNumber(node).replace('Chapter', '').trim();
    return `Ch. ${number} `;
  }

  return archiveTreeSectionIsBook(node.parent)
    ? getArchiveTreeSectionTitle(node) + ' '
    : getParentPrefix(node.parent);

};

const hideMath = (node: HTMLElement) => {
  if (!node) {
    return '';
  }

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

export const getTextContent = (str: string) => {
  const parsed = domParser.parseFromString(str, 'text/html');
  const text = parsed.body.textContent;
  return text || '';
};

const removeIntroContent = (node: HTMLElement) => {
  if (!node) {
    return null;
  }

  const introContentList = node.querySelectorAll(
    '[data-type="abstract"], .learning-objectives, .chapter-objectives, .be-prepared'
    ) || [];

  for (let i = 0; i <= introContentList.length; i++) {
    if (introContentList[i]) {
      const parent = introContentList[i].parentNode;
      if (parent === null) {
        break;
      }
      parent.removeChild(introContentList[i]);
    }
  }
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
  const parentPrefix = getParentPrefix(node).replace('Ch.', 'Chapter').trim();
  const parentIsChapter = node.parent ? archiveTreeSectionIsChapter(node.parent) : true;
  const parentIsBook = node.parent ? archiveTreeSectionIsBook(node.parent) : false;
  const sectionTitle = getArchiveTreeSectionTitle(node);
  const parentTitle = node.parent ? getTextContent(node.parent.title) : '';

  if (pageType === 'page') {
    removeIntroContent(contentNode);
    const mathless = hideMath(contentNode.querySelector('p'));
    return mathless && mathless.textContent ? mathless.textContent.trim().substring(0, 155) : '';
  } else {
    let descriptionPhrase = '';
    if (pageType === 'answer-key') {
      descriptionPhrase = `the Answer Key for ${sectionTitle} of`;
    } else if (!parentIsChapter && !parentIsBook) {
      descriptionPhrase = `${parentTitle}: ${sectionTitle} for ${parentPrefix} of`;
    } else if (sectionTitle !== parentPrefix) {
      descriptionPhrase = `the ${sectionTitle} for ${parentPrefix} of`;
    } else {
      descriptionPhrase = `the ${sectionTitle} for`;
    }
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
