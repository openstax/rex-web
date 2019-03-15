import { HTMLElement } from '@openstax/types/lib.dom';
import { AllHtmlEntities } from 'html-entities';
import flatten from 'lodash/fp/flatten';
import { OSWebBook } from '../../helpers/createOSWebLoader';
import { isArchiveTree } from './guards';
import replaceAccentedCharacters from './replaceAccentedCharacters';
import { content as contentRoute } from './routes';
import { ArchiveBook, ArchiveTree, ArchiveTreeSection, Book, LinkedArchiveTreeSection, Page } from './types';

export const stripIdVersion = (id: string): string => id.split('@')[0];
export const getIdVersion = (id: string): string | undefined => id.split('@')[1];

export const getContentPageReferences = (content: string) =>
  (content.match(/\/contents\/([a-z0-9\-]+(@[\d\.]+)?)(:([a-z0-9\-]+(@[\d\.]+)?))?/g) || [])
    .map((match) => {
      const id = match.substr(10);
      const bookId = id.indexOf(':') > -1 && id.split(':')[0];
      const pageId = id.indexOf(':') > -1 ? id.split(':')[1] : id;

      return {
        bookUid: bookId ? stripIdVersion(bookId) : undefined,
        bookVersion: bookId ? getIdVersion(bookId) : undefined,
        match,
        pageUid: stripIdVersion(pageId),
      };
    });

export function flattenArchiveTree(tree: ArchiveTree): LinkedArchiveTreeSection[] {
  return flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section) ? flattenArchiveTree(section) : [{...section, parent: tree}]))
  ).map((section) => ({
    id: stripIdVersion(section.id),
    parent: section.parent,
    shortId: stripIdVersion(section.shortId),
    title: section.title,
    version: getIdVersion(section.id),
  }));
}

export function bookDetailsUrl(book: Book) {
  return `/details/books/${book.slug}`;
}

export const scrollTocSectionIntoView = (sidebar: HTMLElement | undefined, activeSection: HTMLElement | undefined) => {
  if (!activeSection || !sidebar) {
    return;
  }

  // do nothing if the LI is already visible
  if (activeSection.offsetTop > sidebar.scrollTop
    && activeSection.offsetTop - sidebar.scrollTop < sidebar.offsetHeight) {
    return;
  }

  let search = activeSection.parentElement;
  let selectedChapter: undefined | HTMLElement;
  while (search && !selectedChapter && search !== sidebar) {
    if (search.nodeName === 'LI') {
      selectedChapter = search;
    }
    search = search.parentElement;
  }

  const chapterSectionDelta = selectedChapter && (activeSection.offsetTop - selectedChapter.offsetTop);
  const scrollTarget = selectedChapter && chapterSectionDelta && (chapterSectionDelta < sidebar.offsetHeight)
    ? selectedChapter
    : activeSection;

  sidebar.scrollTop = scrollTarget.offsetTop;
};

export const formatBookData = (archiveBook: ArchiveBook, osWebBook: OSWebBook): Book => ({
  ...archiveBook,
  authors: osWebBook.authors,
  publish_date: osWebBook.publish_date,
  slug: osWebBook.meta.slug,
  theme: osWebBook.cover_color,
});

export const getBookPageUrlAndParams = (book: Book, page: Pick<Page, 'id' | 'shortId' | 'title'>) => {
  const params = {
    book: book.slug,
    page: getUrlParamForPageId(book, page.shortId),
  };

  return {params, url: contentRoute.getUrl(params)};
};

export const findDefaultBookPage = (book: {tree: ArchiveTree}) => {
  const getFirstTreeSection = (tree: ArchiveTree) => tree.contents.find(isArchiveTree);

  const getFirstTreeSectionOrPage = (tree: ArchiveTree): ArchiveTreeSection => {
    const firstSection = getFirstTreeSection(tree);

    if (firstSection) {
      return getFirstTreeSectionOrPage(firstSection);
    } else {
      return tree.contents[0];
    }
  };

  return getFirstTreeSectionOrPage(book.tree);
};

export const findArchiveTreeSection = (
  book: {tree: ArchiveTree},
  pageId: string
): LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(book.tree).find((section) =>
    stripIdVersion(section.shortId) === stripIdVersion(pageId)
    || stripIdVersion(section.id) === stripIdVersion(pageId)
  );

const splitTitleParts = (str: string) => {
  const match = str
    // remove html tags from tree title
    .replace(/<[^>]+>/g, '')
    // split out section number from title
    .match(/^([0-9\.]*)?(.*)$/);

  if (match && match[2]) {
    // ignore the first match which is the whole title
    return match.slice(1);
  } else {
    return [null, null];
  }
};

const getCleanSectionNumber = (section: LinkedArchiveTreeSection): string => {
  return (splitTitleParts(section.title)[0] || splitTitleParts(section.parent.title)[0] || '')
    // use dash instead of '.'
    .replace(/\./g, '-')
  ;
};

const getCleanSectionTitle = (section: LinkedArchiveTreeSection): string => {
  const decoder = new AllHtmlEntities();

  return replaceAccentedCharacters(decoder.decode(splitTitleParts(section.title)[1] || ''))
    // handle space delimiters
    .replace(/[-_]+/g, ' ')
    // remove special characters
    .replace(/[^a-z0-9 ]/gi, '')
    .toLowerCase();
};

const getUrlParamForPageTitle = (section: LinkedArchiveTreeSection): string => {
  const cleanNumber = getCleanSectionNumber(section);
  const cleanTitle = getCleanSectionTitle(section);

  if (!cleanTitle) {
    throw new Error(`BUG: could not URL encode page title: "${section.title}"`);
  }

  return `${cleanNumber ? `${cleanNumber} ` : ''}${cleanTitle}`
    // spaces to dashes
    .replace(/ +/g, '-')
  ;
};

const getUrlParamForPageIdCache = new Map();
export const getUrlParamForPageId = (book: Pick<Book, 'id' | 'tree' | 'title'>, pageId: string): string => {
  const cacheKey = `${book.id}:${pageId}`;

  if (getUrlParamForPageIdCache.has(cacheKey)) {
    return getUrlParamForPageIdCache.get(cacheKey);
  }

  const treeSection = findArchiveTreeSection(book, pageId);
  if (!treeSection) {
    throw new Error(`BUG: could not find page "${pageId}" in ${book.title}`);
  }
  const result = getUrlParamForPageTitle(treeSection);

  getUrlParamForPageIdCache.set(cacheKey, result);

  return result;
};

export const getPageIdFromUrlParam = (book: Book, pageParam: string): string | undefined => {
  for (const section of flattenArchiveTree(book.tree)) {
    const sectionParam = getUrlParamForPageTitle(section);
    if (sectionParam && sectionParam.toLowerCase() === pageParam.toLowerCase()) {
      return stripIdVersion(section.id);
    }
  }
};

const getCommonParts = (firstPath: string[], secondPath: string[]) => {
  const result = [];

  for (let i = 0; i < firstPath.length; i++) {
    if (firstPath[i] === secondPath[i]) {
      result.push(firstPath[i]);
    } else {
      break;
    }
  }
  return result;
};

const trimTrailingSlash = (path: string) => path.replace(/([^\/]{1})\/+$/, '$1');

export const toRelativeUrl = (from: string, to: string) => {
  const parsedFrom = trimTrailingSlash(from).split('/');
  const parsedTo = trimTrailingSlash(to).split('/');

  // remove the last piece of the "to" so that it is always output
  const commonParts = getCommonParts(parsedFrom, parsedTo.slice(0, -1));

  return '../'.repeat(parsedFrom.length - commonParts.length - 1)
    + parsedTo.slice(commonParts.length).join('/');
};
