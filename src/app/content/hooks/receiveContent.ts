import { setHead } from '../../head/actions';
import { Link } from '../../head/types';
import { pathname } from '../../navigation/selectors';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receivePage } from '../actions';
import { defaultTheme } from '../components/constants';
import { hasOSWebData } from '../guards';
import { content as contentRoute } from '../routes';
import * as select from '../selectors';
import { getCanonicalUrlParams } from '../utils/canonicalUrl';
import getCleanContent from '../utils/getCleanContent';
import { createTitle } from '../utils/seoUtils';

const stripHtmlAndTrim = (str: string) => str
  .replace(/<[^>]*>/g, ' ')
  .replace(/ +/g, ' ')
  .trim()
  .substring(0, 155)
  .trim();

const hookBody: ActionHookBody<typeof receivePage> = ({
  getState,
  dispatch,
  archiveLoader,
  osWebLoader}) => async() => {

  const state = getState();
  const book = select.book(state);
  const page = select.page(state);
  const loadingBook = select.loadingBook(state);
  const loadingPage = select.loadingPage(state);
  const currentPath = pathname(state);

  if (!page || !book) {
    return;
  }
  if (loadingBook) {
    return;
  }
  if (loadingPage) {
    return;
  }

  const title = createTitle(page, book);

  // the abstract could be '<div/>'.
  const abstract = stripHtmlAndTrim(page.abstract ? page.abstract : '');
  const description = abstract || stripHtmlAndTrim(getCleanContent(book, page, archiveLoader));
  const canonical = await getCanonicalUrlParams(archiveLoader, osWebLoader, book, page.id, book.version);
  const canonicalUrl = canonical && contentRoute.getUrl(canonical);
  const bookTheme = theme.color.primary[hasOSWebData(book) ? book.theme : defaultTheme].base;

  const links = canonicalUrl ? [
    {rel: 'canonical', href: `https://openstax.org${canonicalUrl}`} as Link,
  ] : [];
  const meta = [
    {name: 'description', content: description},
    {property: 'og:description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:url', content: `https://openstax.org${currentPath}`},
    {name: 'theme-color', content: bookTheme},
  ];

  if (hasOSWebData(book) && book.promote_image) {
    meta.push({ property: 'og:image', content: book.promote_image.meta.download_url });
  }

  dispatch(setHead({links, meta, title}));
};

export default hookBody;
