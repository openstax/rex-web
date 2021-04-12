import { Node } from 'styled-icons/fa-brands';
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
}

export const createDescription = (pageContent: string, node: LinkedArchiveTreeNode | undefined): string => {
  if (!node) {
    return '';
  }

  const doc = domParser.parseFromString(pageContent, 'text/html');
  const contentNode = doc.body.children[0];
  const pageType = getPageType(contentNode);

  const prefix = getParentPrefix(node.parent).trim();
  const sectionTitle = getArchiveTreeSectionTitle(node);
  const chapterFromSlug = node.slug.match(/\d*(?=-)/) || [];
  const isAnswerKey = prefix === 'Answer Key';

  if (pageType === "page") {
    const firstParagraph = contentNode.querySelector('p');
    const mathSpans = firstParagraph.querySelectorAll('.os-math-in-para');
    mathSpans.forEach((el) => {
      el.outerHTML = "...";
    })
    console.log(firstParagraph.textContent.substring(0, 155))
    return contentNode.querySelector('p')?.outerHTML || '';
  } else if (isAnswerKey) {
    return `the Answer Key of ${sectionTitle}`;
  } else {
    return chapterFromSlug[0] ? `${sectionTitle} for Chapter ${chapterFromSlug[0]} of` : `${sectionTitle} for`;
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
