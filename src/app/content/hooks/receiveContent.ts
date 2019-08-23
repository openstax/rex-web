import { setHead } from '../../head/actions';
import theme from '../../theme';
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

  const title = `${page.title} - ${book.title} - OpenStax`;
  const description = page.abstract.replace(/<[^>]*>/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
    .substring(0, 155)
    .trim();

  dispatch(setHead({
    meta: [
      {name: 'description', content: description},
      {property: 'og:description', content: description},
      {property: 'og:title', content: title},
      {name: 'theme-color', content: theme.color.primary[book.theme].base},
    ],
    title,
  }));
};

export default hookBody;
