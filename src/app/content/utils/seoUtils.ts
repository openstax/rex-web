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

type PageTypes = 'page' | 'answer-key' | 'subpage' | 'eoc-page' | 'eob-page';

interface DescriptionTemplateValues {
  parentTitle: string;
  parentType: 'chapter' | 'book' | 'other';
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

  node.querySelectorAll('.os-math-in-para').forEach((el: Element) => {
    el.outerHTML = '...';
  });
  return node.textContent;
};

export const getTextContent = (str: string) => {
  const parsed = domParser.parseFromString(str, 'text/html');
  const text = parsed.body.textContent;
  return text;
};

const removeExcludedContent = (node: HTMLElement) => {
  if (!node) {
    return null;
  }
  const excludedContent = node.querySelectorAll(
    '[data-type="abstract"], .learning-objectives, .chapter-objectives, .be-prepared, .os-teacher'
    ) || [];

  for (let i = 0; i <= excludedContent.length; i++) {
    if (excludedContent[i]) {
      excludedContent[i].remove();
    }
  }
};

export const generateExcerpt = (str: string) => {
  return str.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 152) + '...';
};

const getPageType = (node: HTMLElement, values: DescriptionTemplateValues): PageTypes => {
  const {parentType, parentPrefix, pageTitle} = values;
  const nodeClasses = node.classList;
  const nodeType = node.getAttribute('data-type');

  if (nodeType === 'page' && !nodeClasses.contains('appendix')) {
    return 'page';
  } else if (pageTitle === parentPrefix) {
    return 'eob-page';
  } else if (
    nodeClasses.contains('os-solution-container')
      || nodeClasses.contains('os-solutions-container')
    ) {
    return 'answer-key';
  } else if (parentType !== 'chapter' && parentType !== 'book') {
    return 'subpage';
  } else if (pageTitle !== parentPrefix) {
    return 'eoc-page';
  } else {
    throw new Error('no page type detected');
  }
};

const getPageDescriptionFromContent = (node: HTMLElement): string | null => {
  if (!node) {
    return null;
  }
  removeExcludedContent(node);
  const paragraphs = node.querySelectorAll('section>p') || node.querySelectorAll('p');

  if (!paragraphs) {
    return null;
  }

  const foundByLength = Array.from(paragraphs).find((p) => p.textContent ? p.textContent.length >= 90 : null);
  const mathless = foundByLength ? hideMath(foundByLength) : null;
  return mathless ? generateExcerpt(mathless) : null;
};

// tslint:disable: max-line-length
const generateDescriptionFromTemplate = (pageType: PageTypes, values: DescriptionTemplateValues) => {
  const {parentTitle, pageTitle, bookTitle, parentPrefix} = values;
  switch (pageType) {
    case 'page':
      return `On this page you will discover the ${pageTitle} for ${parentPrefix} of OpenStax's ${bookTitle} free textbook.`;
    case 'answer-key':
      return `On this page you will discover the Answer Key for ${pageTitle} of OpenStax's ${bookTitle} free textbook.`;
    case 'subpage':
      return `On this page you will discover ${parentTitle}: ${pageTitle} for ${parentPrefix} of OpenStax's ${bookTitle} free textbook.`;
    case 'eoc-page':
      return `On this page you will discover the ${pageTitle} for ${parentPrefix} of OpenStax's ${bookTitle} free textbook.`;
    case 'eob-page':
      return `On this page you will discover the ${pageTitle} for OpenStax's ${bookTitle} free textbook.`;
    default:
       throw new Error('unknown page type');
  }
};

const getTemplateVars = (book: Book, node: LinkedArchiveTreeNode) => {
  const parentTitle = node.parent ? getTextContent(node.parent.title) : null;
  const parentPrefix = getParentPrefix(node, true).replace('Ch.', 'Chapter').trim();
  const pageTitle = getArchiveTreeSectionTitle(node);
  const parentType = node.parent && archiveTreeSectionIsChapter(node.parent)
    ? 'chapter'
    : (node.parent && archiveTreeSectionIsBook(node.parent)
      ? 'book'
      : 'other');

  const values: DescriptionTemplateValues = {
    bookTitle: book.title,
    pageTitle,
    parentPrefix,
    parentTitle,
    parentType,
  };

  return values;
};

export const getPageDescription = (loader: AppServices['archiveLoader'], book: Book, page: Page) => {
  const cleanContent = getCleanContent(book, page, loader);
  const doc = domParser.parseFromString(cleanContent, 'text/html');
  const node = doc.body.children[0];
  const treeNode = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );

  const values = getTemplateVars(book, treeNode);
  const pageType = getPageType(node, values);

  const contentDescription: string | null = pageType === 'page'
    ? getPageDescriptionFromContent(node)
    : null;

  return contentDescription || generateDescriptionFromTemplate(pageType, values);
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
