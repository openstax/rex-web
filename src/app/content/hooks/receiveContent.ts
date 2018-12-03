import { setHead } from '../../head/actions';
import { ActionHookBody } from '../../types';
import { receiveBook, receivePage } from '../actions';
import * as select from '../selectors';

const hookBody: ActionHookBody<typeof receivePage | typeof receiveBook> = ({getState, dispatch}) => () => {
  const state = getState();
  const book = select.book(state);
  const page = select.page(state);
  const loadingBook = select.loadingBook(state);
  const loadingPage = select.loadingPage(state);

  if (!book || !page) {
    return;
  }
  if (loadingBook && book.id !== loadingBook) {
    return;
  }
  if (loadingPage && page.id !== loadingPage) {
    return;
  }

  dispatch(setHead({
    meta: [
      {property: 'og:description', content: ''},
    ],
    title: `${book.title} / ${page.title}`,
  }));
};

export default hookBody;
