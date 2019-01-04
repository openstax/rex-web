import css from 'cnx-recipes/styles/output/intro-business.json';
import { BOOKS } from '../../../config';
import { Match, RouteHookBody } from '../../navigation/types';
import { AppServices, FirstArgumentType, MiddlewareAPI } from '../../types';
import { assertDefined } from '../../utils';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { content } from '../routes';
import * as select from '../selectors';
import { ArchivePage, Book } from '../types';
import { flattenArchiveTree, getContentPageReferences, getPageIdFromUrlParam, getUrlParamForPageId } from '../utils';

const fontMatches = css.match(/"(https:\/\/fonts\.googleapis\.com\/css\?family=.*?)"/);
const fonts = fontMatches ? fontMatches.slice(1) : [];

const hookBody: RouteHookBody<typeof content> = (services) => async({match}) => {
  const {fontCollector} = services;

  fonts.forEach((font) => fontCollector.add(font));

  const [book, loader] = await resolveBook(services, match);
  await resolvePage(services, match, book, loader);
};

const resolveBook = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
  const {dispatch, getState, archiveLoader} = services;
  const [bookSlug, bookId, bookVersion] = await resolveBookReference(services, match);

  const loader = archiveLoader.book(bookId, bookVersion);
  const state = getState();
  const bookState = select.book(state);
  const book = bookState && bookState.id === bookId ? bookState : undefined;

  if (book) {
    return [book, loader];
  }

  const getResponse = async(): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
    const newBook = {
      ...await loader.load(),
      slug: bookSlug,
    };
    return [newBook, archiveLoader.book(newBook.id, newBook.version)];
  };

  if (bookSlug !== select.loadingBook(state)) {
    dispatch(requestBook(bookSlug));
    const response = await getResponse();
    dispatch(receiveBook(response[0]));
    return response;
  } else {
    return await getResponse();
  }
};

const resolveBookReference = async(
  {osWebLoader}: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[string, string, string]> => {
  const bookSlug = match.params.book;

  if (match.state) {
    return [bookSlug, match.state.bookUid, match.state.bookVersion];
  }

  const bookUid = await osWebLoader.getBookIdFromSlug(bookSlug);
  const bookVersion = assertDefined(BOOKS[bookUid], `BUG: ${bookSlug} (${bookUid}) is not in BOOKS configuration`
  ).defaultVersion;

  return [bookSlug, bookUid, bookVersion];
};

const resolvePage = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>,
  book: Book,
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>
) => {
  const {dispatch, getState} = services;
  const state = getState();
  const pageId = match.state ? match.state.pageUid : getPageIdFromUrlParam(book, match.params.page);

  if (!pageId) {
    // TODO - 404 handling
    throw new Error('Page not found');
  }

  const pageState = select.page(state);
  const page = pageState && pageState.id === pageId ? pageState : undefined;

  if (page) {
    return page;
  } else if (match.params.page !== select.loadingPage(state)) {
    dispatch(requestPage(match.params.page));
    return await bookLoader.page(pageId).load()
      .then(loadContentReferences(book, bookLoader))
      .then((pageData) => dispatch(receivePage(pageData)) && pageData)
    ;
  }
};

const loadContentReferences = (
  book: Book,
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>
) =>
  async(page: ArchivePage) => {
    const contentReferences = getContentPageReferences(page.content);
    const bookPages = flattenArchiveTree(book.tree);
    const references: FirstArgumentType<typeof receivePage>['references'] = [];

    const promises: Array<Promise<any>> = [];

    for (const reference of contentReferences) {
      if (reference.bookUid || reference.bookVersion) {
        throw new Error('BUG: Cross book references are not supported');
      }
      if (!bookPages.find((search) => search.id === reference.pageUid)) {
        throw new Error(`BUG: ${reference.pageUid} is not present in the ToC`);
      }

      promises.push(
        bookLoader.page(reference.pageUid).load()
          .then((referenceData) => references.push({
            match: reference.match,
            params: {
              book: book.slug,
              page: getUrlParamForPageId(book, referenceData.id),
            },
            state: {
              bookUid: book.id,
              bookVersion: book.version,
              pageUid: referenceData.id,
            },
          }))
      );
    }

    await Promise.all(promises);

    return {
      ...page,
      references,
    };
  };

export default hookBody;
