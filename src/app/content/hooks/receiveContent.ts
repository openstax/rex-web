import { setHead } from '../../head/actions';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receiveBook, receivePage } from '../actions';
import * as select from '../selectors';
import { getUrlParamForPageId } from '../utils/urlUtils';

const hookBody: ActionHookBody<typeof receivePage | typeof receiveBook> = ({getState, dispatch, archiveLoader}) => async () => {

  const CANONICAL_LIST = [
    {id: '7fccc9cf-9b71-44f6-800b-f9457fd64335', version: '7.4'}, // Chemistry
  ];

  // const {archiveLoader, osWebLoader} = this.props.services;
  // const bookEntries = Object.entries(BOOKS);
  // const books: State['books'] = await getBooks(archiveLoader, osWebLoader, bookEntries)

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

  let canonicalBookId = book.id;
  let pageInBook = getUrlParamForPageId(book, page.shortId);

  for (const entry of CANONICAL_LIST) {
    const id = entry.id;
    const version = entry.version;

    const b = await archiveLoader.book(id, version).load();
    const p = getUrlParamForPageId(b, page.shortId, true);

    if (p) {
      canonicalBookId = b.id;
      pageInBook = p;
      break
    }
  }

  dispatch(setHead({
    meta: [
      {property: 'og:description', content: ''},
      {name: 'theme-color', content: theme.color.primary[book.theme].base},
    ],
    link: [
      {rel: 'canonical', href: `../../book.....@${book.slug}/pages/${getUrlParamForPageId(book, page.shortId)}`},
      {rel: 'canonical', href: `../../canonical@${canonicalBookId}/pages/${pageInBook}`},
    ],
    title: `${book.title} / ${page.title}`,
  }));
};

export default hookBody;
