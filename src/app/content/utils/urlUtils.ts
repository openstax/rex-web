import { APP_ENV } from '../../../config';
import { getBookVersionFromUUIDSync } from '../../../gateways/createBookConfigLoader';
import { content as contentRoute } from '../routes';
import { Book, BookWithOSWebData, Page, Params } from '../types';
import { findArchiveTreeNodeById, findArchiveTreeNodeByPageParam } from './archiveTreeUtils';
import { stripIdVersion } from './idUtils';

export function bookDetailsUrl(book: BookWithOSWebData) {
  return `/details/books/${book.slug}`;
}

export const getBookPageUrlAndParams = (
  book: Pick<Book, 'id' | 'tree' | 'title' | 'version'> & Partial<{slug: string}>,
  page: Pick<Page, 'id' | 'title'>
) => {
  const params: Params = {
    book: getUrlParamsForBook(book),
    page: getUrlParamForPageId(book, page.id),
  };
  const state = {
    bookUid: book.id,
    bookVersion: book.version,
    pageUid: stripIdVersion(page.id),
  };

  const search = contentRoute.getSearch && contentRoute.getSearch(params);
  const query = search ? `?${search}` : '';

  return {params, state, url: contentRoute.getUrl(params) + query};
};

export const getUrlParamsForBook = (
  book: Pick<Book, 'id' | 'tree' | 'title' | 'version'> & Partial<{slug: string}>
): Params['book'] => {
  const bookVersionFromConfig = getBookVersionFromUUIDSync(book.id);
  if ('slug' in book && book.slug && bookVersionFromConfig) {
    return book.version === bookVersionFromConfig.defaultVersion
      ? {slug: book.slug}
      : {slug: book.slug, version: book.version};
  } else {
    return {uuid: book.id, version: book.version};
  }
};

const getUrlParamForPageIdCache = new Map();
export const getUrlParamForPageId = (book: Pick<Book, 'id' | 'tree' | 'title'>, pageId: string): Params['page'] => {

  const cacheKey = `${book.id}:${pageId}`;

  if (getUrlParamForPageIdCache.has(cacheKey)) {
    return getUrlParamForPageIdCache.get(cacheKey);
  }

  const treeSection = findArchiveTreeNodeById(book.tree, pageId);
  if (!treeSection) {
    throw new Error(`BUG: could not find page "${pageId}" in ${book.title}`);
  }

  if (APP_ENV === 'production' && !treeSection.slug) {
    throw new Error(`could not find page slug for "${pageId}" in ${book.title}`);
  }

  const param = treeSection.slug
    ? {slug: treeSection.slug}
    : {uuid: treeSection.id};

  getUrlParamForPageIdCache.set(cacheKey, param);
  return param;
};

export const getPageIdFromUrlParam = (book: Book, pageParam: Params['page']): string | undefined => {
  if ('uuid' in pageParam) {
    return pageParam.uuid;
  }

  const pageNode = findArchiveTreeNodeByPageParam(book.tree, pageParam);
  if (!pageNode) { return; }

  return stripIdVersion(pageNode.id);
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

export const toRelativeUrl = (from: string, to: string) => {
  const parsedFrom = from.split('/');
  const parsedTo = to.split('/');

  // remove the last piece of the "to" so that it is always output
  const commonParts = getCommonParts(parsedFrom, parsedTo.slice(0, -1));

  return '../'.repeat(Math.max(0, parsedFrom.length - commonParts.length - 1))
    + parsedTo.slice(commonParts.length).join('/');
};

export const fromRelativeUrl = (base: string, to: string) => {
  if (isAbsoluteUrl(base)) {
    return (new URL(to, base)).toString();
  } else {
    // this hostname is required by the URL constructor but we ignore it in our response, the value is irrelevant
    const urlBase = new URL(to, `https://openstax.org${base}`);
    return urlBase.pathname + urlBase.search + urlBase.hash;
  }
};

export const isAbsolutePath = (url: string) => {
  const pattern = /^\/[^/]{1}/i;
  return pattern.test(url);
};

export const isAbsoluteUrl = (url: string) => {
  const pattern = /^(https?:)?\/\//i;
  return pattern.test(url);
};
