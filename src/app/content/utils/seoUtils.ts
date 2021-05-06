// tslint:disable: max-line-length
import { Element, HTMLElement } from '@openstax/types/lib.dom';
import { IntlShape } from 'react-intl';
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

type Services = {
  intl: AppServices['intl'];
  loader: AppServices['archiveLoader'];
};

const domParser = new DOMParser();

export const getParentPrefix = (node: LinkedArchiveTreeNode | undefined, intl: IntlShape, includeTitle: boolean = false): string => {
  if (!node) {
    return '';
  }

  if (archiveTreeSectionIsChapter(node)) {
    const number = getArchiveTreeSectionNumber(node).trim();
    const name = getArchiveTreeSectionTitle(node);
    const prefixVariant = includeTitle ? 'with-name' : 'without-name';
    return intl.formatMessage({id: `i18n:metadata:title:${prefixVariant}`}, {number, name});
  }

  return archiveTreeSectionIsBook(node.parent)
    ? getArchiveTreeSectionTitle(node) + ' '
    : getParentPrefix(node.parent, intl, includeTitle);

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

  const excludedSelectors = [
    // Introductory content
    '[data-type="abstract"]',
    '.learning-objectives',
    '.chapter-objectives',
    '.be-prepared',
    '.os-teacher',
    // End notes and references
    'section.suggested-reading',
    'section.references',
    // Footnote superscript
    '[role="doc-noteref"]',
  ];

  const excludedContent = node.querySelectorAll(excludedSelectors.join(',')) || [];

  for (const item of Array.from(excludedContent)) {
    if (item) {
      item.remove();
    }
  }
};

export const generateExcerpt = (str: string) => {
  return str.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 152) + '...';
};

const getParagraphs = (page: HTMLElement) => {
  const sectionParaSelectors = [
    '[data-type="page"]>section>p',
    '[data-type="composite-page"]>section>p',
    '.intro-body>.intro-text>section>p',
  ];

  const paraSelectors = [
    '[data-type="page"]>p',
    '[data-type="composite-page"]>p',
    '.intro-body>.intro-text>p',
  ];

  const sectionParagraphs = Array.from(page.querySelectorAll(sectionParaSelectors.join(',')));
  const pageParagraphs = Array.from(page.querySelectorAll(paraSelectors.join(',')));

  return [...sectionParagraphs, ...pageParagraphs];
};

const getPageDescriptionFromContent = (page: HTMLElement): string | null => {
  if (!page) {
    return null;
  }
  removeExcludedContent(page);

  const paragraphs = getParagraphs(page);
  const foundByLength = Array.from(paragraphs).find((p) => {
    const mathlessP = hideMath(p);
    return mathlessP.textContent && mathlessP.textContent.length >= 90 ? mathlessP : null;
  });
  return foundByLength && foundByLength.textContent ? generateExcerpt(foundByLength.textContent) : null;
};

export const getPageDescription = (services: Services, book: Book, page: Page) => {
  const {intl, loader} = services;
  const cleanContent = getCleanContent(book, page, loader);
  const doc = domParser.parseFromString(cleanContent, 'text/html');
  const treeNode = findArchiveTreeNodeById(book.tree, page.id);
  if (!treeNode) {
    return '';
  }
  const pageNode = doc.body.firstElementChild;
  const isAppendix = pageNode.classList.contains('appendix');
  const contentDescription: string | null = isAppendix ? null : getPageDescriptionFromContent(pageNode);

  return contentDescription || intl.formatMessage({id: 'i18n:metadata:description'});
};

export const createTitle = (page: Page, book: Book, intl: IntlShape): string => {
  const node = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );
  const [nodeNumber, nodeTitle] = splitTitleParts(node.title);
  const title = `${nodeTitle} - ${book.title} | OpenStax`;

  if (nodeNumber) {
    return `${nodeNumber} ${title}`;
  }

  return getParentPrefix(node.parent, intl) + title;
};
