import { HTMLElement } from '@openstax/types/lib.dom';
import flatten from 'lodash/fp/flatten';
import { isArchiveTree } from './guards';
import replaceAccentedCharacters from './replaceAccentedCharacters';
import { ArchiveTree, Book, LinkedArchiveTreeSection } from './types';

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

export const findArchiveTreeSection = (
  book: {tree: ArchiveTree},
  pageId: string
): LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(book.tree).find((section) =>
    stripIdVersion(section.shortId) === stripIdVersion(pageId)
    || stripIdVersion(section.id) === stripIdVersion(pageId)
  );

const getUrlParamForPageTitle = (section: LinkedArchiveTreeSection): string => {
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

  const [sectionNumber, sectionTitle] = splitTitleParts(section.title);

  if (!sectionTitle) {
    throw new Error(`BUG: could not URL encode page title: "${section.title}"`);
  }

  const cleanNumber = (sectionNumber || splitTitleParts(section.parent.title)[0] || '')
    // use dash instead of '.'
    .replace(/\./g, '-')
  ;

  const cleanTitle = replaceAccentedCharacters(sectionTitle)
    // handle space delimiters
    .replace(/[-_]+/g, ' ')
    // remove special characters
    .replace(/[^a-z0-9 ]/gi, '')
  ;

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
