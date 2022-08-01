import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { BooksConfig } from '../../gateways/createBookConfigLoader';
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
  UuidParams,
  VersionedArchiveBookWithConfig
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

const pickArchiveFields = (archiveBook: VersionedArchiveBookWithConfig) => ({
  archivePath: archiveBook.archivePath,
  archiveVersion: archiveBook.archiveVersion,
  booksConfig: archiveBook.booksConfig,
  contentVersion: archiveBook.contentVersion,
  id: archiveBook.id,
  language: archiveBook.language,
  license: archiveBook.license,
  revised: archiveBook.revised,
  title: archiveBook.title,
  tree: {
    ...archiveBook.tree,
    contents: parseContents(archiveBook, archiveBook.tree.contents),
  },
});

export const formatBookData = <O extends OSWebBook | undefined>(
  archiveBook: VersionedArchiveBookWithConfig,
  osWebBook: O
): O extends OSWebBook ? BookWithOSWebData : VersionedArchiveBookWithConfig => {
  if (osWebBook === undefined) {
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    return pickArchiveFields(archiveBook) as VersionedArchiveBookWithConfig as any;
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
  osWebLoader: AppServices['osWebLoader'],
  // TODO - think about this
  // the purpose of the second format is for passing a book in, like "make the loader for books in relation
  // to this other book" but that might not work correctly right now because we only want to specify the
  // archive version if it is an override
  options: { archiveVersion?: string; config: BooksConfig } | {archiveVersion: string; booksConfig: BooksConfig}
) => async(bookOptions: {bookId: string, contentVersion?: string}) => {
  const bookLoader =  archiveLoader.book({
    ...bookOptions,
    archiveVersion: options.archiveVersion,
    config: 'booksConfig' in options ? options.booksConfig : options.config,
  });
  const osWebBook = await osWebLoader.getBookFromId(bookOptions.bookId);
  const archiveBook = await bookLoader.load();
  const book = formatBookData(archiveBook, osWebBook);

  if (!hasOSWebData(book)) {
    throw new Error(`could not load cms data for book: ${bookOptions.bookId}`);
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
