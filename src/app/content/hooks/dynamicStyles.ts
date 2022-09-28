import { OutputParams } from 'query-string';
import { query as querySelector } from '../../navigation/selectors';
import { ActionHookBody, AppServices } from '../../types';
import { receiveBook, setStylesUrl } from '../actions';
import { book as bookSelector, loadingBook as loadingBookSelector } from '../selectors';
import { State } from '../types';
import { fromRelativeUrl, isAbsoluteUrl } from '../utils/urlUtils';

const getCssFileUrl = (
  queryParams: OutputParams, book: State['book'], archiveLoader: AppServices['archiveLoader']
) => {
  // The type of queryParams['content-style'] could also be string[] but we don't want that
  if (queryParams['content-style'] && typeof queryParams['content-style'] === 'string') {
    return queryParams['content-style'];
  } else if (book) {
    const dynamicStylesEnabled = book.loadOptions.booksConfig.books[book.id]?.dynamicStyles;

    if (dynamicStylesEnabled && book.style_href) {
      if (isAbsoluteUrl(book.style_href)) {
        return book.style_href;
      } else {
        const contentUrl = archiveLoader.forBook(book).url();
        return fromRelativeUrl(contentUrl, book.style_href);
      }
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

  const stylesUrl = getCssFileUrl(query, book, archiveLoader);

  if (stylesUrl) {
    // Load the styles so they are cached
    await archiveLoader.resource(stylesUrl, book.loadOptions).load();

    dispatch(setStylesUrl(stylesUrl));
  }
};

export default hookBody;
