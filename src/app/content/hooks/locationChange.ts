import css from 'cnx-recipes/styles/output/intro-business.json';
import { routeHook } from '../../navigation/utils';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { content } from '../routes';
import * as select from '../selectors';

const fontMatches = css.match(/"(https:\/\/fonts\.googleapis\.com\/css\?family=.*?)"/);
const fonts = fontMatches ? fontMatches.slice(1) : [];

export default routeHook(content, ({dispatch, getState, fontCollector, archiveLoader}) => async({match}) => {
  const state = getState();
  const {bookId, pageId} = match.params;
  const book = select.book(state);
  const page = select.page(state);
  const promises: Array<Promise<any>> = [];

  fonts.forEach((font) => fontCollector.add(font));

  const [bookRefId, bookRefVersion, pageRefId] = match.state
    ? [match.state.bookUid, match.state.bookVersion, match.state.pageUid]
    : [bookId, undefined, pageId];

  const archiveBookLoader = archiveLoader.book(bookRefId, bookRefVersion);

  if ((!book || book.shortId !== bookId) && bookId !== select.loadingBook(state)) {
    dispatch(requestBook(bookId));
    promises.push(archiveBookLoader.load().then((bookData) => dispatch(receiveBook(bookData))));
  }

  if ((!page || page.shortId !== pageId) && pageId !== select.loadingPage(state)) {
    dispatch(requestPage(pageId));
    promises.push(archiveBookLoader.page(pageRefId).load().then((pageData) => dispatch(receivePage(pageData))));
  }

  await Promise.all(promises);
});
