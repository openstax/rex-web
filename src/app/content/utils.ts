import { OSWebBook } from '../../gateways/createOSWebLoader';
import { AppServices } from '../types';
import { hasOSWebData } from './guards';
import { ArchiveBook, ArchiveContent, ArchiveTree, BookWithOSWebData } from './types';
import { stripIdVersion } from './utils/idUtils';
export { findDefaultBookPage, flattenArchiveTree } from './utils/archiveTreeUtils';
export { getBookPageUrlAndParams, getPageIdFromUrlParam, getUrlParamForPageId, toRelativeUrl } from './utils/urlUtils';
export { stripIdVersion } from './utils/idUtils';
export { scrollSidebarSectionIntoView } from './utils/domUtils';

const cleanArchiveTree = (node: ArchiveTree['contents'][0]) => {
  const chapterSlug = /^chapter-/;
  const appendixSlug = /^appendix-/;
  const chapterTitle = 'Chapter ';
  const appendixTitle = 'Appendix ';

  if ('contents' in node) {
    node.contents.forEach((item) => {
      item.slug = item.slug.replace(chapterSlug, '').replace(appendixSlug, '');

      const domNode = new DOMParser().parseFromString(item.title, 'text/html');
      const numNode = domNode.querySelector('.os-number');
      const dividerNode = domNode.querySelector('.os-divider');

      if (numNode && dividerNode && numNode.textContent.match(appendixTitle)) {
        dividerNode.textContent = ' | ';
      }
      if (numNode) {
        numNode.textContent = numNode.textContent.replace(chapterTitle, '').replace(appendixTitle, '');
      }

      item.title = domNode.body.innerHTML;

      cleanArchiveTree(item);
    });
  }
};

export const cleanArchiveResponse = (archiveContent: ArchiveContent) => {

  if ('tree' in archiveContent) {
    cleanArchiveTree(archiveContent.tree);
  }

  return archiveContent;
};

export const getContentPageReferences = (content: string) =>
  (content.match(/"\/contents\/([a-z0-9-]+(@[\d.]+)?)/g) || [])
    .map((match) => {
      const pageId = match.substr(11);

      return {
        match: match.substr(1),
        pageUid: stripIdVersion(pageId),
      };
    });

export const formatBookData = <O extends OSWebBook | undefined>(
  archiveBook: ArchiveBook,
  osWebBook: O
): O extends OSWebBook ? BookWithOSWebData : ArchiveBook => {
  if (osWebBook === undefined) {
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    return archiveBook as ArchiveBook as any;
  }

  return {
      ...archiveBook,
      amazon_link: osWebBook.amazon_link,
      authors: osWebBook.authors,
      publish_date: osWebBook.publish_date,
      slug: osWebBook.meta.slug,
      theme: osWebBook.cover_color,
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    } as BookWithOSWebData as any;
};

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => async(bookId: string, bookVersion?: string) => {
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
