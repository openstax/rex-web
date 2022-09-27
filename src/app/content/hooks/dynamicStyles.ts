import { OutputParams } from 'query-string';
import { query } from '../../navigation/selectors';
import { ActionHookBody } from '../../types';
import { receiveBook, setStylesUrl } from '../actions';
import { State } from '../content/types';
import { fromRelativeUrl, isAbsoluteUrl } from '../content/utils/urlUtils';
import { book as bookSelector, loadingBook } from '../selectors';
import { AppServices } from '../types';

const getCssFileUrl = (
  queryParams: OutputParams, book: State['book'], archiveLoader: AppServices['archiveLoader']
) => {
  if (queryParams['content-style']) {
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

const hookBody: ActionHookBody<typeof receiveBook> = (services) => () => {
  const { getState, dispatch, archiveLoader } = services;

  const state = getState();
  const book = bookSelector(state);
  const loadingBook = loadingBook(state);
  const queryParams = query(state);

  if (loadingBook || !book) {
    return;
  }

  const stylesUrl = getCssFileUrl(queryParams, book, archiveLoader);

  if (stylesUrl) {
    dispatch(setStylesUrl(styles));
  }
};

export default hookBody;
