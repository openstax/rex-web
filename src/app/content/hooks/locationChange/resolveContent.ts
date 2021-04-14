import isEqual from 'lodash/fp/isEqual';
import { APP_ENV, BOOKS, UNLIMITED_CONTENT } from '../../../../config';
import { Match } from '../../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined, BookNotFoundError } from '../../../utils';
import { receiveBook, receivePage, receivePageNotFoundId, requestBook, requestPage } from '../../actions';
import { hasOSWebData } from '../../guards';
import { content } from '../../routes';
import * as select from '../../selectors';
import { ArchivePage, Book, PageReferenceError, PageReferenceMap } from '../../types';
import {
  formatBookData,
  getContentPageReferences,
  getIdFromPageParam,
  getPageIdFromUrlParam,
} from '../../utils';
import { archiveTreeContainsNode, archiveTreeSectionIsBook } from '../../utils/archiveTreeUtils';
import { getUrlParamForPageId, getUrlParamsForBook } from '../../utils/urlUtils';

export default async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
) => {
  const [book, loader] = await resolveBook(services, match);
  const page = await resolvePage(services, match, book, loader);

  if (!hasOSWebData(book) && APP_ENV === 'production') {
    throw new Error('books without cms data are only supported outside production');
  }

  return {book, page};
};

const getBookResponse = async(
  osWebLoader: AppServices['osWebLoader'],
  archiveLoader: AppServices['archiveLoader'],
  loader: ReturnType<AppServices['archiveLoader']['book']>,
  bookSlug?: string
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]>  => {
  const osWebBook = bookSlug ? await osWebLoader.getBookFromSlug(bookSlug) : undefined;
  const archiveBook = await loader.load();
  const newBook = formatBookData(archiveBook, osWebBook);
  return [newBook, archiveLoader.book(newBook.id, newBook.version)];
};

const resolveBook = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
  const {dispatch, getState, archiveLoader, osWebLoader} = services;
  const [bookSlug, bookId, bookVersion] = await resolveBookReference(services, match);

  const loader = archiveLoader.book(bookId, bookVersion);
  const state = getState();
  const bookState = select.book(state);
  const book = bookState && bookState.id === bookId ? bookState : undefined;

  if (book) {
    return [book, loader];
  }

  if (!isEqual((match.params.book), select.loadingBook(state))) {
    dispatch(requestBook(match.params.book));
    const response = await getBookResponse(osWebLoader, archiveLoader, loader, bookSlug);
    dispatch(receiveBook(response[0]));
    return response;
  } else {
    return await getBookResponse(osWebLoader, archiveLoader, loader, bookSlug);
  }
};

export const resolveBookReference = async(
  {osWebLoader, getState}: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[string | undefined, string, string]> => {
  const state = getState();
  const currentBook = select.book(state);

  const bookSlug = 'slug' in match.params.book
    ? match.params.book.slug
    : currentBook && hasOSWebData(currentBook) && currentBook.id === match.params.book.uuid
      ? currentBook.slug
      : await osWebLoader.getBookSlugFromId(match.params.book.uuid);

  if (match.state && 'bookUid' in match.state && match.state.bookVersion) {
    return [bookSlug, match.state.bookUid,  match.state.bookVersion];
  }

  const bookUid  = 'uuid' in match.params.book
    ? match.params.book.uuid
    : currentBook && hasOSWebData(currentBook) && currentBook.slug === match.params.book.slug
      ? currentBook.id
      : await osWebLoader.getBookIdFromSlug(match.params.book.slug);

  if (!bookUid) {
    throw new BookNotFoundError(`Could not resolve uuid for slug: ${bookSlug}`);
  }

  const { defaultVersion } = assertDefined(
    BOOKS[bookUid],
    `BUG: ${bookSlug} (${bookUid}) is not in BOOKS configuration`
  );

  return [bookSlug, bookUid, defaultVersion];
};

const loadPage = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>,
  book: Book,
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>,
  pageId: string
) => {
  services.dispatch(requestPage(match.params.page));
  return await bookLoader.page(pageId).load()
    .then(loadContentReferences(services, book))
    .then((pageData) => services.dispatch(receivePage(pageData)) && pageData)
  ;
};

const resolvePage = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>,
  book: Book,
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>
) => {
  const {dispatch, getState} = services;
  const state = getState();
  const pageId = match.state && 'pageUid' in match.state
    ? match.state.pageUid
    : getPageIdFromUrlParam(book, match.params.page);

  if (!pageId) {
    dispatch(receivePageNotFoundId(getIdFromPageParam(match.params.page)));
    return;
  }

  const loadingPage = select.loadingPage(state);
  const pageState = select.page(state);
  if (pageState && pageState.id === pageId) {
    return pageState;
  } else if (!isEqual(loadingPage, match.params.page)) {
    return await loadPage(services, match, book, bookLoader, pageId);
  }
};

const getInputReferenceInfo = (bookId: string, inputVersion?: string) => {
  const defaultVersion = BOOKS[bookId] ? BOOKS[bookId].defaultVersion : undefined;
  const bookVersion = inputVersion ? inputVersion : defaultVersion;
  return {bookId, bookVersion};
};

export const getBookInformation = async(
  services: AppServices & MiddlewareAPI,
  reference: ReturnType<typeof getContentPageReferences>[number]
) => {
  const { bookId, bookVersion } = getInputReferenceInfo(reference.bookId, reference.bookVersion);

  if (!bookVersion && UNLIMITED_CONTENT) {
    return undefined;
  }

  const osWebBook =  await services.osWebLoader.getBookFromId(bookId);

  if (!bookVersion) {
    throw new Error(`book version wasn't specified for book ${bookId}`);
  }

  const archiveBook = await services.archiveLoader.book(bookId, bookVersion)
    .load()
    .catch((e) => {
      if (UNLIMITED_CONTENT) {
        return undefined;
      }
      throw e;
    });

  if (archiveBook && archiveTreeSectionIsBook(archiveBook.tree)) {
    return {osWebBook, archiveBook};
  }

  return undefined;
};

export const resolveExternalBookReference = async(
  services: AppServices & MiddlewareAPI,
  book: Book,
  page: ArchivePage,
  reference: ReturnType<typeof getContentPageReferences>[number]
) => {
  const bookInformation = await getBookInformation(services, reference);

  // Don't throw an error if reference couldn't be loaded when UNLIMITED_CONTENT is truthy
  // It will be processed in contentLinkHandler.ts
  if (UNLIMITED_CONTENT && !bookInformation) {
    return bookInformation;
  }

  const error = (message: string) => new Error(
    `BUG: "${book.title} / ${page.title}" referenced "${reference.pageId}", ${message}`
  );

  if (!bookInformation) {
    throw error('but it could not be found in any configured books.');
  }

  const referencedBook = formatBookData(bookInformation.archiveBook, bookInformation.osWebBook);

  if (!archiveTreeContainsNode(referencedBook.tree, reference.pageId)) {
    throw error(`archive thought it would be in "${referencedBook.id}", but it wasn't`);
  }

  return referencedBook;
};

export const loadContentReference = async(
  services: AppServices & MiddlewareAPI,
  book: Book,
  page: ArchivePage,
  reference: ReturnType<typeof getContentPageReferences>[number]
): Promise<PageReferenceMap | PageReferenceError> => {
  const targetBook: Book | undefined = archiveTreeContainsNode(book.tree, reference.pageId)
    ? book
    : await resolveExternalBookReference(services, book, page, reference);

  if (!targetBook) {
    return {
      match: reference.match,
      type: 'error',
    };
  }

  return {
    match: reference.match,
    params: {
      book: getUrlParamsForBook(targetBook),
      page: getUrlParamForPageId(targetBook, reference.pageId),
    },
    state: {
      bookUid: targetBook.id,
      bookVersion: targetBook.version,
      pageUid: reference.pageId,
    },
  };
};

const loadContentReferences = (services: AppServices & MiddlewareAPI, book: Book) => async(page: ArchivePage) => {
  const contentReferences = getContentPageReferences(page.content);
  const references: Array<PageReferenceMap | PageReferenceError> = [];
  for (const reference of contentReferences) {
    references.push(await loadContentReference(services, book, page, reference));
  }

  return {
    ...page,
    references,
  };
};
