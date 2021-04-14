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

export const getParentPrefix = (node: LinkedArchiveTreeNode | undefined, includeTitle: boolean = false): string => {
  if (!node) {
    return '';
  }

  if (archiveTreeSectionIsChapter(node)) {
    const number = getArchiveTreeSectionNumber(node).replace('Chapter', '').trim();
    const name = getArchiveTreeSectionTitle(node);
    return includeTitle ? `Ch. ${number}. ${name}` : `Ch. ${number} `;
  }

  return archiveTreeSectionIsBook(node.parent)
    ? getArchiveTreeSectionTitle(node) + ' '
    : getParentPrefix(node.parent, includeTitle);

};

const hideMath = (node: Element) => {
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
    '[data-type="abstract"], .learning-objectives, .chapter-objectives, .be-prepared, .os-teacher'
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

const getFirstParagraph = (node: HTMLElement) => {
  if (!node) {
    return '';
  }
  // First look for first p in a section.
  const firstSection = node.querySelector('section');
  const first = firstSection
    ? firstSection.querySelector('p')
    : node.querySelector('p');

  if (!first || !first.textContent) {
    return '';
  }

  // Find first p longer than 100 chars.
  if (first.textContent.length < 90) {
    let next = first.nextElementSibling;

    while (next && next.textContent) {
      if (next.matches('p') && next.textContent.length >= 90) {
        return next;
      }
      next = next.nextElementSibling;
    }
  } else {
    return first;
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
  const parentPrefix = getParentPrefix(node, true).replace('Ch.', 'Chapter').trim();
  const parentIsChapter = node.parent ? archiveTreeSectionIsChapter(node.parent) : true;
  const parentIsBook = node.parent ? archiveTreeSectionIsBook(node.parent) : false;
  const sectionTitle = getArchiveTreeSectionTitle(node);
  const parentTitle = node.parent ? getTextContent(node.parent.title) : '';

  if (pageType === 'page') {
    removeIntroContent(contentNode);
    const firstP = getFirstParagraph(contentNode);
    const mathless = firstP ? hideMath(firstP) : '';
    return mathless && mathless.textContent
      ? mathless.textContent.replace(/\n/g, ' ').replace(/\s\s/g, ' ').trim().substring(0, 152) + '...'
      // tslint:disable-next-line:max-line-length
      : `On this page you will discover the ${sectionTitle} for ${parentPrefix} of OpenStax's ${book.title} free textbook.`;
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
    return `On this page you will discover ${descriptionPhrase} OpenStax's ${book.title} free textbook.`;
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
