import { routeHook } from '../../navigation/utils';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { content } from '../routes';
import * as select from '../selectors';
import { archiveLoader } from '../utils';

export default routeHook(content, ({dispatch, getState}) => async({match}) => {
  const state = getState();
  const {bookId, pageId} = match.params;
  const book = select.book(state);
  const page = select.page(state);

  if ((!book || book.id !== bookId) && bookId !== select.loadingBook(state)) {
    dispatch(requestBook(bookId));
    archiveLoader(bookId).then((bookData) => dispatch(receiveBook(bookData)));
  }

  if ((!page || page.id !== pageId) && pageId !== select.loadingPage(state)) {
    dispatch(requestPage(pageId));
    archiveLoader(`${bookId}:${pageId}`).then((pageData) => dispatch(receivePage(pageData)));
  }
});
