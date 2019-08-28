import { setHead } from '../../head/actions';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { assertDefined } from '../../utils';
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

  const title = `${page.title} - ${book.title} - OpenStax`;

  const description = page.abstract && page.abstract.replace(/<[^>]*>/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
    .substring(0, 155)
    .trim();
  const canonical = assertDefined(
    await getCanonicalUrlParams(archiveLoader, osWebLoader, book.id, page.shortId),
    'should have found a canonical book and page'
  );
  const canonicalUrl = contentRoute.getUrl(canonical);

  dispatch(setHead({
    links: [
      {rel: 'canonical', href: `https://openstax.org${canonicalUrl}`},
    ],
    meta: [
      ...(description ? [
        {name: 'description', content: description},
        {property: 'og:description', content: description},
      ] : []),
      {property: 'og:title', content: title},
      {property: 'og:url', content: `https://openstax.org${canonicalUrl}`},
      {name: 'theme-color', content: theme.color.primary[book.theme].base},
    ],
    title,
  }));
};

export default hookBody;
