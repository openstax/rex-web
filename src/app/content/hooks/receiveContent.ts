import { setHead } from '../../head/actions';
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
  .replace(/(<span class="os-math-in-para">)(.*?)(<\/span>)/g, ' ... ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/ +/g, ' ')
  .trim()
  .substring(0, 155)
  .trim();

const getPageType = (str: string) => {
  const dataTypes = str.match(/(data-type=")([\w\-]+)"/) || [];
  return dataTypes.length ? dataTypes[0].replace(/(data-type=")/g, ' ').replace(/"/g, ' ').trim() : '';
}

const getFirstParagraph = (str: string) => {
  const paragraphs = str.match(/<p (.*?)>(.*?)<\/p>/g) || [];
  return paragraphs[0];
}

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
  // const abstract = stripHtmlAndTrim(page.abstract ? page.abstract : '');
  const cleanContent = getCleanContent(book, page, archiveLoader);
  const pageType = getPageType(cleanContent);
  const firstParagraph = getFirstParagraph(cleanContent);
  const description = pageType === "page" ? stripHtmlAndTrim(firstParagraph): `On this page you will discover the ${page.title} for Chapter X of OpenStax's ${book.title} free college textbook.`
  const canonical = await getCanonicalUrlParams(archiveLoader, osWebLoader, book, page.id, book.version);
  const canonicalUrl = canonical && contentRoute.getUrl(canonical);
  const bookTheme = theme.color.primary[hasOSWebData(book) ? book.theme : defaultTheme].base;

  dispatch(setHead({
    links: canonicalUrl ? [
      {rel: 'canonical', href: `https://openstax.org${canonicalUrl}`},
    ] : [],
    meta: [
      {name: 'description', content: description},
      {property: 'og:description', content: description},
      {property: 'og:title', content: title},
      {property: 'og:url', content: `https://openstax.org${currentPath}`},
      {name: 'theme-color', content: bookTheme},
    ],
    title,
  }));
};

export default hookBody;
