import { setHead } from '../../head/actions';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receiveBook, receivePage } from '../actions';
import * as select from '../selectors';
import { getUrlParamForPageId } from '../utils/urlUtils';
import { getBook } from '../../developer/components/utils';
import { Link } from '../../head/types';

const hookBody: ActionHookBody<typeof receivePage | typeof receiveBook> = ({getState, dispatch, archiveLoader, osWebLoader}) => async () => {

  const CANONICAL_LIST = [
    {id: '7fccc9cf-9b71-44f6-800b-f9457fd64335', version: '7.4'}, // Chemistry
  ];

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

  const links: Link[] = [];

  for (const entry of CANONICAL_LIST) {
    const id = entry.id;
    const version = entry.version;

    const canonicalBook = await getBook(id, version, archiveLoader, osWebLoader);
    const pageInBook = getUrlParamForPageId(canonicalBook, page.shortId, true);

    if (pageInBook) {
      links.push({rel: 'canonical', href: `../../${canonicalBook.slug}/pages/${pageInBook}`})
      break
    }
  }


  dispatch(setHead({
    meta: [
      {property: 'og:description', content: ''},
      {name: 'theme-color', content: theme.color.primary[book.theme].base},
    ],
    link: links,
    title: `${book.title} / ${page.title}`,
  }));
};

export default hookBody;
