import { setHead } from '../../head/actions';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receiveBook, receivePage } from '../actions';
import * as select from '../selectors';
import { getCanonicalUrl } from '../../developer/components/utils';
import { Link } from '../../head/types';

const hookBody: ActionHookBody<typeof receivePage | typeof receiveBook> = ({getState, dispatch, archiveLoader, osWebLoader}) => async () => {

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

  const canonical = await getCanonicalUrl(archiveLoader, osWebLoader, book.id, page.shortId)
  if (canonical) {
    links.push({rel: 'canonical', href: `../../${canonical.bookSlug}/pages/${canonical.pageSlug}`})
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
