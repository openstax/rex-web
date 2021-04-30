import { Element, HTMLElement } from '@openstax/types/lib.dom';
// import { useIntl } from 'react-intl';
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
    const number = getArchiveTreeSectionNumber(node).trim();
    const name = getArchiveTreeSectionTitle(node);
    return includeTitle ? `Ch. ${number}. ${name}` : `Ch. ${number} `;
  }

  return archiveTreeSectionIsBook(node.parent)
    ? getArchiveTreeSectionTitle(node) + ' '
    : getParentPrefix(node.parent, includeTitle);

};

const hideMath = (node: Element) => {
  node.querySelectorAll('math, .os-math-in-para').forEach((el: Element) => {
    el.outerHTML = '...';
  });
  return node;
};

export const getTextContent = (str: string) => {
  const parsed = domParser.parseFromString(str, 'text/html');
  const text = parsed.body.textContent;
  return text;
};

const removeExcludedContent = (node: Element) => {
  if (!node) {
    return null;
  }
  const excludedContent = node.querySelectorAll(
    '[data-type="abstract"], .learning-objectives, .chapter-objectives, .be-prepared, .os-teacher'
  ) || [];

  for (const item of Array.from(excludedContent)) {
    if (item) {
      item.remove();
    }
  }
};

export const generateExcerpt = (str: string) => {
  return str.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 152) + '...';
};

const getPageDescriptionFromContent = (page: HTMLElement): string | null => {
  if (!page) {
    return null;
  }
  removeExcludedContent(page);
  // tslint:disable-next-line: max-line-length
  const paragraphs = [...Array.from(page.querySelectorAll(':scope>section>p')), ...Array.from(page.querySelectorAll(':scope>p'))];
  const foundByLength = Array.from(paragraphs).find((p) => {
    const mathlessP = hideMath(p);
    return mathlessP.textContent && mathlessP.textContent.length >= 90 ? mathlessP : null;
  });
  return foundByLength && foundByLength.textContent ? generateExcerpt(foundByLength.textContent) : null;
};

export const getPageDescription = (loader: AppServices['archiveLoader'], book: Book, page: Page) => {
  const cleanContent = getCleanContent(book, page, loader);
  const doc = domParser.parseFromString(cleanContent, 'text/html');
  const treeNode = findArchiveTreeNodeById(book.tree, page.id);
  if (!treeNode) {
    return '';
  }
  const contentDescription: string | null = getPageDescriptionFromContent(doc.body.firstElementChild);

  // tslint:disable-next-line: max-line-length
  return contentDescription || 'OpenStax is a non-profit organization committed to improving student access to quality learning materials. Our free textbooks are developed and peer-reviewed by educators to ensure they are readable and accurate.';
  // return contentDescription || useIntl().formatMessage({id: 'i18n:metadata:description'});
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
