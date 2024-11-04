import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { OSWebBook } from '../../gateways/createOSWebLoader';
import { isDefined } from '../guards';
import { AppServices } from '../types';
import { hasOSWebData, isArchiveTree } from './guards';
import {
  ArchiveBook,
  ArchiveLoadOptions,
  ArchivePage,
  ArchiveTree,
  ArchiveTreeNode,
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
        // TODO - cross book links no longer have versions in them ever, and
        // putting the same book version here isn't really necessary, so we
        // should consider removing the version from the references payload
        bookVersion: bookVersion || (!bookId ? book.version : undefined),
        match: matchPath,
        pageId: (pageId && stripIdVersion(pageId)) || page.id,
      };
    });

  return matches;
}

export const parseContents = (book: ArchiveBook, contents: Array<ArchiveTree | ArchiveTreeNode>) => {
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
  archiveVersion: archiveBook.archiveVersion,
  contentVersion: archiveBook.contentVersion,
  id: archiveBook.id,
  language: archiveBook.language,
  license: archiveBook.license,
  loadOptions: archiveBook.loadOptions,
  revised: archiveBook.revised,
  style_href: archiveBook.style_href,
  title: archiveBook.title,
  tree: {
    ...archiveBook.tree,
    contents: parseContents(archiveBook, archiveBook.tree.contents),
  },
  version: archiveBook.version,
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
    content_warning_text: osWebBook.content_warning_text,
    amazon_link: osWebBook.amazon_link,
    polish_site_link: osWebBook.polish_site_link,
    authors: osWebBook.authors,
    book_state: osWebBook.book_state,
    categories: osWebBook.book_categories,
    promote_image: osWebBook.promote_image,
    publish_date: osWebBook.publish_date,
    slug: osWebBook.meta.slug,
    subject: osWebBook.book_subjects[0]?.subject_name,
    subjects: osWebBook.book_subjects,
    theme: osWebBook.cover_color,
  // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
  } as BookWithOSWebData as any;
};

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  loadOptions: ArchiveLoadOptions
) => async(bookId: string, versions?: Pick<ArchiveLoadOptions, 'contentVersion' | 'archiveVersion'>) => {
  const bookLoader =  archiveLoader.book(bookId, {...loadOptions, ...versions});
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
