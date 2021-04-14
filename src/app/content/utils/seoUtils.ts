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

type PageTypes = 'page' | 'appendix' | 'answer-key' | 'eoc-sub-page' | 'eoc-page' | 'eob-page';

interface DescriptionTemplateValues {
  parentTitle: string;
  parentType: 'chapter' | 'book' | 'other';
  pageTitle: string;
  bookTitle: string;
  chapterTitle: string;
  sectionTitle: string;
}

const domParser = new DOMParser();

const hideMath = (node: Element) => {
  if (!node) {
    return '';
  }

  const mathSpans = node.querySelectorAll('.os-math-in-para');
  mathSpans.forEach((el: Element) => {
    el.outerHTML = '...';
  });
  return node.textContent;
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

export const generateExcerpt = (str: string) => {
  return str.replace(/\n/g, ' ').replace(/\s\s/g, ' ').trim().substring(0, 152) + '...';
};

// tslint:disable-next-line: max-line-length
const getPageType = (node: HTMLElement, values: DescriptionTemplateValues): PageTypes => {
  const {parentType, chapterTitle, sectionTitle} = values;
  const nodeClasses = node.classList;
  const nodeType = node.getAttribute('data-type');

  if (nodeType === 'page') {
    return 'page';
  } else if (nodeClasses.contains('appendix')) {
    return 'appendix';
  } else if (
    nodeClasses.contains('os-solution-container')
      || nodeClasses.contains('os-solutions-container')
      ) {
    return 'answer-key';
  } else if (parentType !== 'chapter' && parentType !== 'book') {
    return 'eoc-sub-page';
  } else if (sectionTitle !== chapterTitle) {
    return 'eoc-page';
  } else {
    return 'eob-page';
  }
};

const getPageDescriptionFromContent = (node: HTMLElement): string | null => {
  removeIntroContent(node);
  const firstSection = node.querySelector('section');
  let para: Element | null = firstSection
    ? firstSection.querySelector('p')
    : node.querySelector('p');

  if (!para || !para.textContent) {
    return null;
  }

  // Find first <p> of 90+ chars.
  if (para.textContent.length >= 90) {
    console.log('we have a long enough para');
    const mathless = hideMath(para);
    return mathless ? generateExcerpt(mathless) : null;
  } else {
    console.log('para not long enough');
    const text = para.textContent;
    const next = para.nextElementSibling;
    while (text && text.length < 90 && next) {
      console.log('while text too short...');
      if (next.matches('p')) {
        para = next;
      }
    }
    return null;
  }
};

// tslint:disable: max-line-length
const generateDescriptionFromTemplate = (pageType: PageTypes, values: DescriptionTemplateValues) => {
  const {parentTitle, pageTitle, bookTitle, chapterTitle, sectionTitle} = values;
  switch (pageType) {
    case 'page':
      return `On this page you will discover the ${pageTitle} for ${chapterTitle} of OpenStax's ${bookTitle} free textbook.`;
    case 'answer-key':
      return `On this page you will discover the Answer Key for ${pageTitle} of OpenStax's ${bookTitle} free textbook.`;
    case 'eoc-sub-page':
      return `On this page you will discover the ${parentTitle}: ${sectionTitle} for ${chapterTitle} of OpenStax's ${bookTitle} free textbook.`;
    case 'eoc-page':
      return `On this page you will discover the ${sectionTitle} for ${chapterTitle} of OpenStax's ${bookTitle} free textbook.`;
    case 'eob-page' || 'appendix':
      return `On this page you will discover the ${sectionTitle} for OpenStax's ${bookTitle} free textbook.`;
    default:
       throw new Error('unknown page type');
  }
};

export const getPageDescription = (loader: AppServices['archiveLoader'], book: Book, page: Page) => {
  const cleanContent = getCleanContent(book, page, loader);
  const doc = domParser.parseFromString(cleanContent, 'text/html');
  const node = doc.body.children[0];
  const treeNode = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );

  const parentTitle = treeNode.parent ? getTextContent(treeNode.parent.title) : '';
  const chapterTitle = getParentPrefix(node, true).replace('Ch.', 'Chapter').trim();
  const pageTitle = getArchiveTreeSectionTitle(node);
  const sectionTitle = node.parent ? getTextContent(node.parent.title) : '';
  const parentType = node.parent && archiveTreeSectionIsChapter(node.parent)
    ? 'chapter'
    : (node.parent && archiveTreeSectionIsBook(node.parent)
      ? 'book'
      : 'other');

  const values = {
    bookTitle: book.title,
    chapterTitle,
    pageTitle,
    parentTitle,
    parentType,
    sectionTitle,
  };

  const pageType = getPageType(node, values);

  const contentDescription: string | null = pageType === 'page'
    ? getPageDescriptionFromContent(node)
    : null;

  return contentDescription || generateDescriptionFromTemplate(treeNode, pageType, values);
};

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
