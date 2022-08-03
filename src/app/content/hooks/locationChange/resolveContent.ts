import isEqual from 'lodash/fp/isEqual';
import { APP_ENV, UNLIMITED_CONTENT } from '../../../../config';
import { Match } from '../../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../../types';
import { BookNotFoundError } from '../../../utils';
import { receiveBook, receivePage, receivePageNotFoundId, requestBook, requestPage } from '../../actions';
import { hasOSWebData } from '../../guards';
import { content } from '../../routes';
import * as select from '../../selectors';
import { ArchiveLoadOptions, ArchivePage, Book, PageReferenceError, PageReferenceMap } from '../../types';
import {
  formatBookData,
  getContentPageReferences,
  getIdFromPageParam,
  getPageIdFromUrlParam,
} from '../../utils';
import { archiveTreeContainsNode, archiveTreeSectionIsBook } from '../../utils/archiveTreeUtils';
import { processBrowserRedirect } from '../../utils/processBrowserRedirect';
import { getUrlParamForPageId, getUrlParamsForBook } from '../../utils/urlUtils';

export default async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
) => {
  const [book, loader] = await resolveBook(services, match).catch(async(e) => {
    // if we have any problems loading the requested book, check for a redirect
    // error is only thrown when the redirect isn't found
    if (!(e instanceof BookNotFoundError) || !(await processBrowserRedirect(services))) {
      throw e;
    }

    // it was a problem loading the book and the redirect was successful. this causes
    // a locationChange with the new url and this hook will be fired again, we need to
    // noop the rest of the content processing for this run
    return [undefined, undefined];
  });

  const page = book && loader ? await resolvePage(services, match, book, loader) : undefined;

  if (book && !hasOSWebData(book) && APP_ENV === 'production') {
    throw new Error('books without cms data are only supported outside production');
  }

  return {book, page};
};

const getBookResponse = async(
  osWebLoader: AppServices['osWebLoader'],
  loader: ReturnType<AppServices['archiveLoader']['book']>
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]>  => {
  const archiveBook = await loader.load();
  const osWebBook = await osWebLoader.getBookFromId(archiveBook.id);
  const newBook = formatBookData(archiveBook, osWebBook);

  return [newBook, loader];
};

const resolveBook = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
  const {dispatch, getState, archiveLoader, osWebLoader} = services;
  const {bookId, ...loadOptions} = await resolveBookReference(services, match);

  const loader = archiveLoader.book(bookId, loadOptions);
  const state = getState();
  const bookState = select.book(state);

  const book = bookState && bookState.id === bookId && isEqual(bookState.loadOptions, loadOptions)
    ? bookState
    : undefined;

  if (book) {
    return [book, loader];
  }

  if (!isEqual(match.params.book, select.loadingBook(state))) {
    dispatch(requestBook(match.params.book));
    const response = await getBookResponse(osWebLoader, loader);
    dispatch(receiveBook(response[0]));
    return response;
  } else {
    return await getBookResponse(osWebLoader, loader);
  }
};

export const resolveBookReference = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<ArchiveLoadOptions & {bookId: string}> => {
  const {osWebLoader, bookConfigLoader, getState} = services;
  const state = getState();
  const currentBook = select.book(state);

  const bookId  = 'uuid' in match.params.book
    ? match.params.book.uuid
    : currentBook && hasOSWebData(currentBook) && currentBook.slug === match.params.book.slug
      ? currentBook.id
      : await osWebLoader.getBookIdFromSlug(match.params.book.slug);

  if (!bookId) {
    throw new BookNotFoundError(`Could not resolve uuid for params: ${JSON.stringify(match.params.book)}`);
  }

  const booksConfig = await bookConfigLoader.getOrReloadConfigForBook(bookId);

  const contentVersion = 'contentVersion' in match.params.book
    ? match.params.book.contentVersion
    : undefined;

  const archiveVersion = 'archiveVersion' in match.params.book
    ? match.params.book.archiveVersion
    : undefined;

  // extra logic here to bail on retired books before even trying to load them.
  if (!UNLIMITED_CONTENT && booksConfig.books[bookId]?.retired) {
    throw new BookNotFoundError(`tried to load retired book: ${bookId}`);
  }

  return {
    archiveVersion,
    bookId,
    booksConfig,
    contentVersion,
  };
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
  if (!match.params.page) {
    return;
  }
  const {dispatch, getState} = services;
  const state = getState();
  const pageId = getPageIdFromUrlParam(book, match.params.page);

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

export const getBookInformation = async(
  sourceBook: Book,
  services: AppServices & MiddlewareAPI,
  reference: ReturnType<typeof getContentPageReferences>[number]
) => {
  const osWebBook =  await services.osWebLoader.getBookFromId(reference.bookId);

  // TODO - ContentPageRefencesType includes a content version, but i'm not sure if its possible for it to be
  // populated anymore. its being ignored here, something should be reconciled
  const archiveBook = await services.archiveLoader.fromBook(sourceBook, reference.bookId).load();

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
  const bookInformation = await getBookInformation(book, services, reference);

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
  };
};

const loadContentReferences = (services: AppServices & MiddlewareAPI, book: Book) => async(page: ArchivePage) => {
  const contentReferences = getContentPageReferences(book, page);
  const references: Array<PageReferenceMap | PageReferenceError> = [];
  for (const reference of contentReferences) {
    references.push(await loadContentReference(services, book, page, reference));
  }

  return {
    ...page,
    references,
  };
};
