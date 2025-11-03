import queryString from 'query-string';
import { setHead } from '../../head/actions';
import { initialState as headInitialState } from '../../head/reducer';
import { Link } from '../../head/types';
import createIntl from '../../messages/createIntl';
import { locationChange } from '../../navigation/actions';
import { pathname, query } from '../../navigation/selectors';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receivePage } from '../actions';
import { defaultTheme } from '../components/constants';
import { hasOSWebData } from '../guards';
import { content as contentRoute } from '../routes';
import * as select from '../selectors';
import { getCanonicalUrlParams } from '../utils/canonicalUrl';
import { createTitle, getPageDescription } from '../utils/seoUtils';
import { attributionValues } from '../components/utils/attributionValues';
import { Book } from '../types';

const escapeQuotes = (text: string) => text.replace(/"/g, '&quot;');

function citationMetaTags(book: Book, canonicalHref: string | null) {
  const {bookTitle, publisher, bookPublishDate, language, authorsToDisplay} = attributionValues(book);
  const dateStr = bookPublishDate?.toLocaleDateString('en-us', {month: 'short', day: 'numeric', year: 'numeric'});

  return [
    {name: 'citation_book_title', content: bookTitle},
    {name: 'citation_publisher', content: publisher},
    {name: 'citation_language', content: language},
    ...(dateStr ? [{name: 'citation_date', content: dateStr}] : []),
    ...authorsToDisplay.map((a) => ({name: 'citation_author', content: a.value.name})),
    ...(canonicalHref ? [{name: 'citation_public_url', content: canonicalHref}] : []),
  ];
}

const hookBody: ActionHookBody<typeof receivePage | typeof locationChange> = (services) => async() => {
  const { getState, dispatch, archiveLoader, osWebLoader } = services;

  const state = getState();
  const book = select.book(state);
  const page = select.page(state);
  const loadingBook = select.loadingBook(state);
  const loadingPage = select.loadingPage(state);
  const currentPath = pathname(state);
  const queryParams = queryString.stringify(query(state));
  const queryParamsWithPrefix = queryParams ? `?${queryParams}` : '';

  if (!page || !book) {
    dispatch(
      setHead({ ...headInitialState, title: 'OpenStax - Page Not Found'})
    );
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
  const title = createTitle(page, book, intl, queryParamsWithPrefix);
  const description = getPageDescription(services, intl, book, page);
  const canonical = await getCanonicalUrlParams(archiveLoader, osWebLoader, book, page.id);
  const canonicalUrl = canonical && contentRoute.getUrl(canonical);
  const canonicalHref = canonicalUrl && `https://openstax.org${canonicalUrl}`;
  const bookTheme = theme.color.primary[hasOSWebData(book) ? book.theme : defaultTheme].base;

  const links = canonicalHref ? [
    {rel: 'canonical', href: canonicalHref} as Link,
  ] : [];
  const escapedDescription = escapeQuotes(description);
  const meta = [
    {name: 'description', content: escapedDescription},
    {property: 'og:description', content: escapedDescription},
    {property: 'og:title', content: escapeQuotes(title)},
    {property: 'og:url', content: `https://openstax.org${currentPath}`},
    {name: 'theme-color', content: bookTheme},
    ...citationMetaTags(book, canonicalHref),
  ];

  if (hasOSWebData(book) && book.promote_image) {
    meta.push({ property: 'og:image', content: book.promote_image.meta.download_url });
  }

  if (book.loadOptions.archiveVersion || book.loadOptions.contentVersion || page.noindex) {
    meta.push({ name: 'robots', content: 'noindex' });
  }

  const contentTags = 'subjects' in book && 'categories' in book ? [
    `book=${book.title}`,
    ...book.subjects.map((subject) => `subject=${subject.subject_name}`),
    ...book.categories.map((category) => `category=${category.subject_category} (${category.subject_name})`),
  ] : [];

  dispatch(setHead({links, meta, title, contentTags}));
};

export default hookBody;
