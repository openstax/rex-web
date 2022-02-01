import { getBookVersionFromUUIDSync } from '../../../gateways/createBookConfigLoader';
import { setHead } from '../../head/actions';
import { Link } from '../../head/types';
import createIntl from '../../messages/createIntl';
import { pathname } from '../../navigation/selectors';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receivePage } from '../actions';
import { defaultTheme } from '../components/constants';
import { hasOSWebData } from '../guards';
import { content as contentRoute } from '../routes';
import * as select from '../selectors';
import { getCanonicalUrlParams } from '../utils/canonicalUrl';
import { createTitle, getPageDescription } from '../utils/seoUtils';

const hookBody: ActionHookBody<typeof receivePage> = (services) => async() => {
  const { getState, dispatch, archiveLoader, osWebLoader } = services;

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

  const locale = book.language;
  const intl = await createIntl(locale);
  const title = createTitle(page, book, intl);
  const description = getPageDescription(services, intl, book, page);
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

  if (getBookVersionFromUUIDSync(book.id)?.defaultVersion !== book.version) {
    meta.push({ name: 'robots', content: 'noindex' });
  }

  dispatch(setHead({links, meta, title}));
};

export default hookBody;
