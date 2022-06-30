import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { REACT_APP_ARCHIVE } from '../../config';
import BOOKS from '../../config.books';
import { OSWebBook } from '../../gateways/createOSWebLoader';
import { isDefined } from '../guards';
import { AppServices } from '../types';
import { hasOSWebData, isArchiveTree } from './guards';
import {
  ArchiveBook,
  ArchivePage,
  ArchiveTree,
  ArchiveTreeNode,
  Book,
  BookWithOSWebData,
  Params,
  SlugParams,
  UuidParams
} from './types';
import { CACHED_FLATTENED_TREES, getTitleFromArchiveNode } from './utils/archiveTreeUtils';
import { stripIdVersion } from './utils/idUtils';

export { findDefaultBookPage, flattenArchiveTree } from './utils/archiveTreeUtils';
export { scrollSidebarSectionIntoView } from './utils/domUtils';
export { stripIdVersion } from './utils/idUtils';
export { getBookPageUrlAndParams, getPageIdFromUrlParam, getUrlParamForPageId, toRelativeUrl } from './utils/urlUtils';

export interface ContentPageRefencesType {
  bookId: string;
  bookVersion?: string;
  match: string;
  pageId: string;
}

const hashRegex = `#[^'"]+`;
const pathRegex = `\\./((?<bookId>[a-z0-9-]+)(@(?<bookVersion>[^/]+))?):(?<pageId>[a-z0-9-]+)\\.xhtml(${hashRegex})?`;
const referenceRegex = `^(?<matchPath>((${pathRegex})|(${hashRegex})).*)$`;

export function getContentPageReferences(book: ArchiveBook, page: ArchivePage) {
  const domParser = new DOMParser();
  const domNode = domParser.parseFromString(page.content, 'text/html');

  const matches: ContentPageRefencesType[] = (
    Array.from(domNode.querySelectorAll('a'))
  )
    .map((link) => (link as HTMLAnchorElement).getAttribute('href') || '')
    .map((match) => match.match(new RegExp(referenceRegex))?.groups)
    .filter(isDefined)
    .map(({matchPath, bookId, bookVersion, pageId}) => {

      return {
        bookId: bookId || book.id,
        bookVersion: bookVersion || (!bookId ? book.version : undefined),
        match: matchPath,
        pageId: (pageId && stripIdVersion(pageId)) || page.id,
      };
    });

  return matches;
}

export const parseContents = (book: Book, contents: Array<ArchiveTree | ArchiveTreeNode>) => {
  contents.map((subtree) => {
    subtree.title = getTitleFromArchiveNode(book, subtree);
    if (isArchiveTree(subtree)) {
      subtree.contents = parseContents(book, subtree.contents);
    }
    return subtree;
  });

  CACHED_FLATTENED_TREES.clear();
  // getTitleFromArchiveNode is using `flattenArchiveTree` util that is caching old titles
  // so we have to clear this cache after transforming titles
  // without this everytime when we call functions like findArchiveNodeById we would get old titles, before parsing

  return contents;
};

const pickArchiveFields = (archiveBook: ArchiveBook) => ({
  id: archiveBook.id,
  language: archiveBook.language,
  license: archiveBook.license,
  revised: archiveBook.revised,
  title: archiveBook.title,
  tree: {
    ...archiveBook.tree,
    contents: parseContents(archiveBook, archiveBook.tree.contents),
  },
  version: archiveBook.version,
});

export const formatBookData = <O extends OSWebBook | undefined>(
  archiveBook: ArchiveBook,
  osWebBook: O
): O extends OSWebBook ? BookWithOSWebData : ArchiveBook => {
  if (osWebBook === undefined) {
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    return pickArchiveFields(archiveBook) as ArchiveBook as any;
  }
  return {
    ...pickArchiveFields(archiveBook),
    amazon_link: osWebBook.amazon_link,
    authors: osWebBook.authors,
    book_state: osWebBook.book_state,
    promote_image: osWebBook.promote_image,
    publish_date: osWebBook.publish_date,
    slug: osWebBook.meta.slug,
    theme: osWebBook.cover_color,
  // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
  } as BookWithOSWebData as any;
};

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => async(bookId: string, bookVersion: string) => {
  const bookLoader = archiveLoader.book(bookId, bookVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();
  const book = formatBookData(archiveBook, osWebBook);

  if (!hasOSWebData(book)) {
    throw new Error(`could not load cms data for book: ${bookId}`);
  }

  return book;
};

export const preloadedPageIdIs = (window: Window, id: string) => window.__PRELOADED_STATE__
  && window.__PRELOADED_STATE__.content
  && window.__PRELOADED_STATE__.content.page
  && window.__PRELOADED_STATE__.content.page.id === id;

export const getIdFromPageParam = (param: Params['page'] | null) => {
  if (!param) { return ''; }
  return (param as SlugParams).slug || (param as UuidParams).uuid;
};

export const loadPageContent = async(loader: ReturnType<AppServices['archiveLoader']['book']>, pageId: string) => {
  const page = await loader.page(pageId).load();
  return page.content;
};

export const getBookPipelineVersion = (book: Book): string => {
  return BOOKS[book.id]?.archiveOverride?.replace(/^\/apps\/archive\//, '') || REACT_APP_ARCHIVE;
};
