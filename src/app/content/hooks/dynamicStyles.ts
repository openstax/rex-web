import { OutputParams } from 'query-string';
import { query as querySelector } from '../../navigation/selectors';
import { ActionHookBody } from '../../types';
import { receiveBook, setStylesUrl } from '../actions';
import { book as bookSelector, loadingBook as loadingBookSelector } from '../selectors';
import { Book } from '../types';
import { fromRelativeUrl, isAbsoluteUrl } from '../utils/urlUtils';

const getStylesUrl = (queryParams: OutputParams, book: Book) => {
  // The type of queryParams['content-style'] could also be string[] but we don't want that
  if (queryParams['content-style'] && typeof queryParams['content-style'] === 'string') {
    return queryParams['content-style'];
  } else {
    const dynamicStylesEnabled = book.loadOptions.booksConfig.books[book.id]?.dynamicStyles;

    if (dynamicStylesEnabled && book.style_href) {
      return book.style_href;
    }
  }
};

const hookBody: ActionHookBody<typeof receiveBook> = (services) => async() => {
  const { getState, dispatch, archiveLoader } = services;

  const state = getState();
  const book = bookSelector(state);
  const loadingBook = loadingBookSelector(state);
  const query = querySelector(state);

  if (loadingBook || !book) {
    return;
  }

  const stylesUrl = getStylesUrl(query, book);

  if (stylesUrl) {
    const absoluteStylesUrl = isAbsoluteUrl(stylesUrl) ?
      stylesUrl : fromRelativeUrl(archiveLoader.forBook(book).url(), stylesUrl);

    // Load the styles so they are cached
    await archiveLoader.resource(absoluteStylesUrl, book.loadOptions).load();

    dispatch(setStylesUrl(absoluteStylesUrl));
  }
};

export default hookBody;
