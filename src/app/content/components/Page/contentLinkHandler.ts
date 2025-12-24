import {
  Document,
  HTMLAnchorElement,
  MouseEvent,
} from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import { isHtmlElementWithHighlight } from '../../../guards';
import { push } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import {
  createNavigationOptions,
  navigationOptionsToString,
} from '../../../navigation/utils';
import { AppServices, AppState, Dispatch, MiddlewareAPI } from '../../../types';
import {
  assertNotNull,
  assertWindow,
  memoizeStateToProps,
} from '../../../utils';
import { hasOSWebData, isPageReferenceError } from '../../guards';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import {
  focused,
  hasUnsavedHighlight as hasUnsavedHighlightSelector,
} from '../../highlights/selectors';
import { content } from '../../routes';
import * as select from '../../selectors';
import {
  Book,
  PageReferenceError,
  PageReferenceMap,
  SystemQueryParams,
} from '../../types';
import { isClickWithModifierKeys } from '../../utils/domUtils';
import { getBookPageUrlAndParams, toRelativeUrl } from '../../utils/urlUtils';
import isDoubleClick from './doubleClick';
import queryString from 'query-string';

export const mapStateToContentLinkProp = memoizeStateToProps(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
    focusedHighlight: focused(state),
    hasUnsavedHighlight: hasUnsavedHighlightSelector(state),
    page: select.page(state),
    persistentQueryParams: selectNavigation.persistentQueryParameters(state),
    references: select.contentReferences(state),
    systemQueryParams: selectNavigation.systemQueryParameters(state),
  })
);
export const mapDispatchToContentLinkProp = (dispatch: Dispatch) => ({
  navigate: flow(push, dispatch),
});
export type ContentLinkProp = ReturnType<typeof mapStateToContentLinkProp> &
  ReturnType<typeof mapDispatchToContentLinkProp>;

const reducePageReferenceError = (a: HTMLAnchorElement) => {
  a.removeAttribute('href');
  a.setAttribute(
    'onclick',
    'alert("This link is broken because of a cross book content loading issue")'
  );
};

const reduceReference = (
  reference: PageReferenceMap,
  currentPath: string,
  a: HTMLAnchorElement,
  options: ReturnType<typeof createNavigationOptions>
) => {
  const path = content.getUrl(reference.params);
  const href = assertNotNull(
    a.getAttribute('href'),
    'it was found by having an href attribute'
  );
  const newHref = href.replace(
    reference.match,
    toRelativeUrl(currentPath, path) +
      navigationOptionsToString({ ...options, hash: a.hash })
  );
  a.setAttribute('href', newHref);
};

export const reduceReferences = (
  document: Document,
  { references, currentPath, systemQueryParams }: ContentLinkProp
) => {
  /*
     Testing seems to indicate that exact matches are enough
     There are at least 2 cases that don't seem to currently occur in the content
     that would work in the old code but not here though:
     1. Reference to a page with a query string
     2. Reference with a url fragment containing a single quote
     These cases would only be partially matched by current regexes in getContentPageReferences()
  */
  const referenceMap: {
    [key: string]: PageReferenceMap | PageReferenceError | undefined;
  } = {};

  for (const reference of references) {
    referenceMap[reference.match] = reference;
  }

  const options = createNavigationOptions(
    systemQueryParams as SystemQueryParams
  );

  for (const a of Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[href]')
  )) {
    const href = assertNotNull(
      a.getAttribute('href'),
      'it was found by having an href attribute'
    );

    // The code previously gave priority to reference errors
    // Since we expect that all references have different matches and most references will be good,
    // we check referenceMap before referenceErrorMap here
    const reference = referenceMap[href];

    if (reference) {
      // references may contain PageReferenceError only if UNLIMITED_CONTENT is set to true
      if (isPageReferenceError(reference)) {
        reducePageReferenceError(a);
      } else {
        reduceReference(reference, currentPath, a, options);
      }
    }
    /*
    else {
      console.log(`Reference not found: ${href}`);
    }
    */
  }
};

const isPathReferenceForBook = (pathname: string, book: Book) => (
  ref: PageReferenceMap | PageReferenceError
) =>
  isPageReferenceError(ref)
    ? false
    : content.getUrl(ref.params) === pathname &&
      (('slug' in ref.params.book &&
        hasOSWebData(book) &&
        ref.params.book.slug === book.slug) ||
        ('uuid' in ref.params.book && ref.params.book.uuid === book.id));

export const contentLinkHandler = (
  anchor: HTMLAnchorElement,
  getProps: () => ContentLinkProp,
  services: AppServices & MiddlewareAPI
) => async(e: MouseEvent) => {
  const {
    references,
    navigate,
    book,
    page,
    currentPath,
    hasUnsavedHighlight,
    persistentQueryParams,
  } = getProps();
  const href = anchor.getAttribute('href');
  const target = anchor.getAttribute('target');

  if (
    !href ||
    !book ||
    !page ||
    target === '_blank' ||
    isClickWithModifierKeys(e)
  ) {
    return;
  }

  const base = new URL(assertWindow().location.href);
  base.hash = '';
  base.search = '';

  const { hash, search, pathname } = new URL(href, base.href);
  const reference = references.find(isPathReferenceForBook(pathname, book));

  if (!reference && !(pathname === currentPath && hash)) {
    return;
  }

  e.preventDefault();

  if (isHtmlElementWithHighlight(e.target)) {
    if (!e.target.matches('.focus') && !isDoubleClick(href)) {
      return;
    }
    e.stopPropagation();
  }

  if (hasUnsavedHighlight && !(await showConfirmation(services))) {
    return;
  }

  delete persistentQueryParams.target;
  const extendedSearchString = queryString.stringify({
    ...queryString.parse(search),
    ...persistentQueryParams,
  });
  const params =
    reference && !isPageReferenceError(reference)
      ? reference.params
      : getBookPageUrlAndParams(book, page).params;

  // defer to allow other handlers to execute before nav happens
  defer(() =>
    navigate(
      {
        params,
        route: content,
        state: {},
      },
      { hash, search: extendedSearchString }
    )
  );
};
