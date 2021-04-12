import { assertDefined } from '../../utils';
import { Book, LinkedArchiveTreeNode, Page } from '../types';
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

const hideMath = (node: any) => {
  const mathSpans = node.querySelectorAll('.os-math-in-para');
  mathSpans.forEach((el: any) => {
    el.outerHTML = '...';
  });
  return node;
};

// need to find out correct type here
const getPageType = (node: any) => {
  if (!node) {
    return '';
  }

  if (node.classList.contains('appendix')) {
    return 'appendix';
  } else {
    return node.getAttribute('data-type');
  }
};

export const createDescription = (pageContent: string, book: Book, page: Page) => {
  const doc = domParser.parseFromString(pageContent, 'text/html');
  const contentNode = doc.body.children[0];
  const pageType = getPageType(contentNode);
  const node = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );
  const prefix = getParentPrefix(node.parent).trim();
  const sectionTitle = getArchiveTreeSectionTitle(node);
  const chapterFromSlug = node.slug.match(/\d*(?=-)/) || [];
  const isAnswerKey = prefix === 'Answer Key';

  if (pageType === 'page') {
    const mathless = hideMath(contentNode.querySelector('p'));
    return mathless.textContent.trim().substring(0, 155);
  } else if (isAnswerKey) {
    return `the Answer Key of ${sectionTitle}`;
  } else {
    const descriptionPhrase = chapterFromSlug[0]
      ? `${sectionTitle} for Chapter ${chapterFromSlug[0]} of`
      : `${sectionTitle} for`;
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
