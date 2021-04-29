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

type Services = {
  intl: AppServices['intl'];
  loader: AppServices['archiveLoader'];
};

type PageTypes = 'page' | 'answer-key' | 'subpage' | 'eoc-page' | 'eob-page' | 'appendix' | 'index';

type TreeNodeTypes = 'chapter' | 'book' | 'other';

interface DescriptionTemplateValues {
  parentTitle: string;
  pageTitle: string;
  bookTitle: string;
  parentPrefix: string;
}

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

// tslint:disable-next-line: max-line-length
const getPageType = (node: HTMLElement, parentType: TreeNodeTypes, parentPrefix: string, pageTitle: string ): PageTypes => {
  const nodeClasses = node.classList;
  const nodeType = node.getAttribute('data-type');
  const answerKeyClasses = ['os-solution-container', 'os-solutions-container', 'os-end-of-book-solutions-container'];

  if (nodeType === 'page' && !nodeClasses.contains('appendix')) {
    return 'page';
  } else if (nodeClasses.contains('appendix')) {
    return 'appendix';
  } else if (nodeClasses.contains('os-index-container')) {
    return 'index';
  } else if (pageTitle === parentPrefix) {
    return 'eob-page';
  } else if (answerKeyClasses.some((className) => nodeClasses.contains(className))) {
    return 'answer-key';
  } else if (parentType !== 'chapter' && parentType !== 'book') {
    return 'subpage';
  } else if (pageTitle !== parentPrefix) {
    return 'eoc-page';
  } else {
    throw new Error('no page type detected');
  }
};

const getPageDescriptionFromContent = (node: Element): string | null => {
  const page = node.firstElementChild;
  if (!page) {
    return null;
  }
  removeExcludedContent(page);
  // tslint:disable-next-line: max-line-length
  const paragraphs = [...Array.from(node.querySelectorAll('div:first-child>section>p')), ...Array.from(node.querySelectorAll('div:first-child>p'))];

  const foundByLength = Array.from(paragraphs).find((p) => {
    const mathlessP = hideMath(p);
    return mathlessP.textContent && mathlessP.textContent.length >= 90 ? mathlessP : null;
  });
  return foundByLength && foundByLength.textContent ? generateExcerpt(foundByLength.textContent) : null;
};

const getTemplateVars = (book: Book, node: LinkedArchiveTreeNode) => {
  const parentTitle = node.parent ? getTextContent(node.parent.title) : null;
  const parentPrefix = getParentPrefix(node, true).replace('Ch.', 'Chapter').trim();
  const pageTitle = getArchiveTreeSectionTitle(node);
  const values: DescriptionTemplateValues = {
    bookTitle: book.title,
    pageTitle,
    parentPrefix,
    parentTitle,
  };

  return values;
};

const getParentType = (node: LinkedArchiveTreeNode): TreeNodeTypes =>
  node && node.parent && archiveTreeSectionIsChapter(node.parent)
    ? 'chapter'
    : (node && node.parent && archiveTreeSectionIsBook(node.parent)
      ? 'book'
      : 'other');

export const getPageDescription = (services: Services, book: Book, page: Page) => {
  const intl = services.intl;
  const cleanContent = getCleanContent(book, page, services.loader);
  const doc = domParser.parseFromString(cleanContent, 'text/html');
  const node = doc.body.children[0];
  const treeNode = findArchiveTreeNodeById(book.tree, page.id);
  const values = treeNode ? getTemplateVars(book, treeNode) : undefined;
  if (!values || !treeNode) {
    return '';
  }
  const parentType = getParentType(treeNode);
  const { parentTitle, pageTitle, parentPrefix, bookTitle } = values;
  const pageType = getPageType(node, parentType, parentPrefix, pageTitle);
  console.log('page type: ', pageType);

  const contentDescription: string | null = pageType === 'page'
    ? getPageDescriptionFromContent(doc.body)
    : null;

  return contentDescription
  || intl.formatMessage({ id: `i18n:metadata:${pageType}` }, { parentTitle, pageTitle, parentPrefix, bookTitle });
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
