import { setHead } from '../../head/actions';
import { Link } from '../../head/types';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { content as contentRoute } from '../routes';
import * as select from '../selectors';
import { getCanonicalUrlParams } from '../utils/canonicalUrl';

const hookBody: ActionHookBody<typeof receivePage | typeof receiveBook> = ({
  getState,
  dispatch,
  archiveLoader,
  osWebLoader}) => async() => {

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

  const canonical = await getCanonicalUrlParams(archiveLoader, osWebLoader, book.id, page.shortId);
  if (canonical) {
    links.push({rel: 'canonical', href: contentRoute.getUrl(canonical)});
  }

  dispatch(setHead({
    link: links,
    meta: [
      {property: 'og:description', content: ''},
      {name: 'theme-color', content: theme.color.primary[book.theme].base},
    ],
    title: `${book.title} / ${page.title}`,
  }));
};

export default hookBody;
