import { ActionHookBody } from '../../types';
import { receiveBook, setBookStylesUrl } from '../actions';
import { book as bookSelector, loadingBook as loadingBookSelector } from '../selectors';

const hookBody: ActionHookBody<typeof receiveBook> = (services) => async() => {
  const { getState, dispatch, archiveLoader } = services;

  const state = getState();
  const book = bookSelector(state);
  const loadingBook = loadingBookSelector(state);

  if (loadingBook || !book || !book.style_href ||
      book.loadOptions.booksConfig.books[book.id]?.dynamicStyles === false) {
    return;
  }

  // Load the styles so they are cached
  await archiveLoader.forBook(book).resource(book.style_href).load();

  dispatch(setBookStylesUrl(book.style_href));
};

export default hookBody;
