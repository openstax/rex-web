import { BOOKS } from '../../../config';
import { assertDefined } from '../../utils';
import { content as contentRoute } from '../routes';
import { Book, BookWithOSWebData, Page, Params } from '../types';
import { findArchiveTreeNode, flattenArchiveTree } from './archiveTreeUtils';
import { stripIdVersion } from './idUtils';

export function bookDetailsUrl(book: BookWithOSWebData) {
  return `/details/books/${book.slug}`;
}

export const getBookPageUrlAndParams = (
  book: Pick<Book, 'id' | 'tree' | 'title' | 'version'> & Partial<{slug: string}>,
  page: Pick<Page, 'id' | 'shortId' | 'title'>
) => {
  const params: Params = {
    ...getUrlParamsForBook(book),
    page: getUrlParamForPageId(book, page.shortId),
  };
  const state = {
    bookUid: book.id,
    bookVersion: book.version,
    pageUid: stripIdVersion(page.id),
  };

  if (!('version' in params) && (!BOOKS[book.id] || book.version !== BOOKS[book.id].defaultVersion)) {
    const paramsWithVersion = { ...params, version: book.version };
    return { params: paramsWithVersion, state, url: contentRoute.getUrl(paramsWithVersion) };
  }

  return {params, state, url: contentRoute.getUrl(params)};
};

export const getUrlParamsForBook = (
  book: Pick<Book, 'id' | 'tree' | 'title' | 'version'> & Partial<{slug: string}>
): {slug: string} | {uuid: string, version: string} => {
  if ('slug' in book && book.slug) {
    return {slug: book.slug};
  } else {
    return {uuid: book.id, version: book.version};
  }
};

const getUrlParamForPageIdCache = new Map();
export const getUrlParamForPageId = (book: Pick<Book, 'id' | 'tree' | 'title'>, pageId: string): string => {

  const cacheKey = `${book.id}:${pageId}`;

  if (getUrlParamForPageIdCache.has(cacheKey)) {
    return getUrlParamForPageIdCache.get(cacheKey);
  }

  const treeSection = findArchiveTreeNode(book.tree, pageId);
  if (!treeSection) {
    throw new Error(`BUG: could not find page "${pageId}" in ${book.title}`);
  }
  const result = assertDefined(treeSection.slug, `could not find page slug for "${pageId}" in ${book.title}`);
  getUrlParamForPageIdCache.set(cacheKey, result);

  return result;
};

export const getPageIdFromUrlParam = (book: Book, pageParam: string): string | undefined => {
  for (const section of flattenArchiveTree(book.tree)) {
    const sectionParam = assertDefined(section.slug, `could not find page slug for "${section.id}" in ${book.title}`);
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

const trimTrailingSlash = (path: string) => path.replace(/([^/]{1})\/+$/, '$1');

export const toRelativeUrl = (from: string, to: string) => {
  const parsedFrom = trimTrailingSlash(from).split('/');
  const parsedTo = trimTrailingSlash(to).split('/');

  // remove the last piece of the "to" so that it is always output
  const commonParts = getCommonParts(parsedFrom, parsedTo.slice(0, -1));

  return '../'.repeat(parsedFrom.length - commonParts.length - 1)
    + parsedTo.slice(commonParts.length).join('/');
};
