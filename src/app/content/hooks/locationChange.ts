import css from 'cnx-recipes/styles/output/intro-business.json';
import { RouteHookBody } from '../../navigation/types';
import { AppServices, FirstArgumentType, MiddlewareAPI } from '../../types';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { content } from '../routes';
import * as select from '../selectors';
import { ArchivePage, Book } from '../types';
import { flattenArchiveTree, getContentPageReferences } from '../utils';

const fontMatches = css.match(/"(https:\/\/fonts\.googleapis\.com\/css\?family=.*?)"/);
const fonts = fontMatches ? fontMatches.slice(1) : [];

const hookBody: RouteHookBody<typeof content> = (services) => async({match}) => {
  const {dispatch, getState, fontCollector, archiveLoader} = services;
  const state = getState();
  const {bookId, pageId} = match.params;
  const bookState = select.book(state);
  const pageState = select.page(state);
  const book = bookState && bookState.shortId === bookId ? bookState : undefined;
  const page = pageState && pageState.shortId === pageId ? pageState : undefined;
  const promises: Array<Promise<any>> = [];

  fonts.forEach((font) => fontCollector.add(font));

  const [bookRefId, bookRefVersion, pageRefId] = match.state
    ? [match.state.bookUid, match.state.bookVersion, match.state.pageUid]
    : [bookId, undefined, pageId];

  const archiveBookLoader = archiveLoader.book(bookRefId, bookRefVersion);

  if (!book && bookId !== select.loadingBook(state)) {
    dispatch(requestBook(bookId));
    promises.push(archiveBookLoader.load().then((bookData) => dispatch(receiveBook(bookData)) && bookData));
  }

  if (!page && pageId !== select.loadingPage(state)) {
    dispatch(requestPage(pageId));
    promises.push(
      Promise.all([
        book ? Promise.resolve(book) : archiveBookLoader.load(),
        archiveBookLoader.page(pageRefId).load(),
      ])
        .then(loadContentReferences(services))
        .then((pageData) => dispatch(receivePage(pageData)))
    );
  }

  await Promise.all(promises);
};

const loadContentReferences = ({archiveLoader}: AppServices & MiddlewareAPI) =>
  async([book, page]: [Book, ArchivePage]) => {
    const contentReferences = getContentPageReferences(page.content);
    const bookPages = flattenArchiveTree(book.tree.contents);
    const references: FirstArgumentType<typeof receivePage>['references'] = [];

    const archiveBookLoader = archiveLoader.book(book.id, book.version);
    const promises: Array<Promise<any>> = [];

    for (const reference of contentReferences) {
      if (reference.bookUid || reference.bookVersion) {
        throw new Error('BUG: Cross book references are not supported');
      }
      if (!bookPages.find((search) => search.id === reference.pageUid)) {
        throw new Error(`BUG: ${reference.pageUid} is not present in the ToC`);
      }

      promises.push(
        archiveBookLoader.page(reference.pageUid).load()
          .then((referenceData) => references.push({
            match: reference.match,
            params: {
              bookId: book.shortId,
              pageId: referenceData.shortId,
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
