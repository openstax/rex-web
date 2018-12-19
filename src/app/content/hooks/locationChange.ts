import css from 'cnx-recipes/styles/output/intro-business.json';
import { Match, RouteHookBody } from '../../navigation/types';
import { AppServices, FirstArgumentType, MiddlewareAPI } from '../../types';
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

  await resolveBook(services, match).then(resolvePage(services, match));
};

const resolveBook = async(
  {dispatch, getState, archiveLoader}: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
  const state = getState();
  const bookId = match.params.bookId;
  const bookState = select.book(state);
  const book = bookState && bookState.shortId === bookId ? bookState : undefined;

  const [bookRefId, bookRefVersion] = match.state
    ? [match.state.bookUid, match.state.bookVersion]
    : [bookId, undefined];

  const loader = archiveLoader.book(bookRefId, bookRefVersion);

  if (book) {
    return [book, loader];
  }

  const response = async(): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
    const newBook = await loader.load();
    return [newBook, archiveLoader.book(newBook.id, newBook.version)];
  };

  if (bookId !== select.loadingBook(state)) {
    dispatch(requestBook(bookId));
    return await response().then((params) => {
      dispatch(receiveBook(params[0]));
      return params;
    });
  } else {
    return await response();
  }
};

const resolvePage = (
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
) => async([book, bookLoader]: [Book, ReturnType<AppServices['archiveLoader']['book']>]) => {
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
              bookId: book.shortId,
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
