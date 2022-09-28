import { AppOptions } from '../../src/app';
import { content } from '../../src/app/content/routes';
import { ContentRoute, SlugParams } from '../../src/app/content/types';
import { Match, Route } from '../../src/app/navigation/types';
import { getBooksConfigSync } from '../../src/gateways/createBookConfigLoader';

interface ContentRouteState {
  bookUid: string;
  pageUid: string;
}

const booksConfig = getBooksConfigSync();

// Can't use Omit<Params, 'page'> because we need SlugParams and not UuidParams
type BookParams = { book: SlugParams; };
type BookState = Omit<ContentRouteState, 'pageUid'>;

export type BookMatch = Match<Route<BookParams, {}>>;
export type SerializedBookMatch = Omit<BookMatch, 'route'> & { state: BookState };

export type PageMatch = Match<ContentRoute>;
export type SerializedPageMatch = Omit<PageMatch, 'route'> & { state: ContentRouteState };

export function deserializePageMatch(match: SerializedPageMatch): PageMatch {
  return {...match, route: content};
}

export async function getArchiveBook(services: AppOptions['services'], match: SerializedBookMatch) {
  const {bookUid} = match.state;
  return services.archiveLoader.book(bookUid, {booksConfig}).load();
}

export async function getArchivePage(services: AppOptions['services'], match: SerializedPageMatch) {
  const {bookUid, pageUid} = match.state;
  return services.archiveLoader.book(bookUid, {booksConfig}).page(pageUid).load();
}
