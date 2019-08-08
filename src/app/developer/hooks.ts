import { BOOKS } from '../../config';
import { makeUnifiedBookLoader } from '../content/utils';
import { RouteHookBody } from '../navigation/types';
import { routeHook } from '../navigation/utils';
import { assertDefined } from '../utils';
import { receiveBook, receiveBooks } from './actions';
import * as routes from './routes';

const receiveNavigation: RouteHookBody<typeof routes.developerHome> = (services) => async() => {
  const bookLoader = makeUnifiedBookLoader(services.archiveLoader, services.osWebLoader);
  const books = await Promise.all(Object.entries(BOOKS).map(([bookId, {defaultVersion}]) =>
    bookLoader(bookId, defaultVersion)
  ));

  services.dispatch(receiveBooks(books));
};

type singleBookTools = typeof routes.bookTools | typeof routes.cnxLinkMapping | typeof routes.auditTocHistory;
const loadBook: RouteHookBody<singleBookTools> = (services) => async({match: {params}}) => {
  const bookLoader = makeUnifiedBookLoader(services.archiveLoader, services.osWebLoader);
  const bookUid = params.book;
  const bookVersion = assertDefined(BOOKS[bookUid], 'book not configured...').defaultVersion;

  const book = await bookLoader(bookUid, bookVersion);

  services.dispatch(receiveBook(book));
};

export default [
  routeHook(routes.developerHome, receiveNavigation),
  routeHook(routes.bookTools, loadBook),
  routeHook(routes.auditTocHistory, loadBook),
  routeHook(routes.cnxLinkMapping, loadBook),
];
