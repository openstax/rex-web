import { HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import { push } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import { hasOSWebData } from '../../guards';
import { content } from '../../routes';
import * as select from '../../selectors';
import { Book, PageReferenceMap } from '../../types';
import { getBookPageUrlAndParams, toRelativeUrl } from '../../utils/urlUtils';
import { REACT_APP_ARCHIVE_URL } from '../../../../config';

export const mapStateToContentLinkProp = (state: AppState) => ({
  book: select.book(state),
  currentPath: selectNavigation.pathname(state),
  locationState: selectNavigation.locationState(state),
  page: select.page(state),
  references: select.contentReferences(state),
});
export const mapDispatchToContentLinkProp = (dispatch: Dispatch) => ({
  navigate: flow(push, dispatch),
});
export type ContentLinkProp =
  ReturnType<typeof mapStateToContentLinkProp> & ReturnType<typeof mapDispatchToContentLinkProp>;

export const reduceReferences = ({references, currentPath}: ContentLinkProp) => (pageContent: string) =>
  references.reduce(
    (html, reference) => {
      const path = content.getUrl(reference.params);
      const search = content.getSearch && content.getSearch(reference.params);

      console.log(REACT_APP_ARCHIVE_URL);
      console.log(reference.params);
      console.log(content.getSearch(reference.params));

      const query = search ? `?${search}` : '';
      return html.replace(reference.match, toRelativeUrl(currentPath, path) + query);
    },
    pageContent
  );

const isPathRefernceForBook = (pathname: string, book: Book) => (ref: PageReferenceMap) =>
  content.getUrl(ref.params) === pathname
    && (
      ('slug' in ref.params.book && hasOSWebData(book) && ref.params.book.slug === book.slug)
      || ('uuid' in ref.params.book && ref.params.book.uuid === book.id)
    );

export const contentLinkHandler = (anchor: HTMLAnchorElement, getProps: () => ContentLinkProp) => (e: MouseEvent) => {
  const {references, navigate, book, page, locationState, currentPath} = getProps();
  const href = anchor.getAttribute('href');

  if (!href || !book || !page || e.metaKey) {
    return;
  }

  const base = new URL(assertWindow().location);
  base.hash = '';
  base.search = '';

  const {hash, search, pathname} = new URL(href, base.href);
  const reference = references.find(isPathRefernceForBook(pathname, book));

  const searchString = search.substring(1);

  if (reference) {
    e.preventDefault();
    // defer to allow other handlers to execute before nav happens
    defer(() => navigate({
      params: reference.params,
      route: content,
      state: {
        ...locationState,
        ...reference.state,
      },
    }, {hash, search: searchString}));
  } else if (pathname === currentPath && hash) {
    e.preventDefault();
    // defer to allow other handlers to execute before nav happens
    defer(() => navigate({
      params: getBookPageUrlAndParams(book, page).params,
      route: content,
      state: {
        ...locationState,
        ...getBookPageUrlAndParams(book, page).state,

      },
    }, {hash, search: searchString}));
  }
};
