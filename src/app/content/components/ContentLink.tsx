import flow from 'lodash/fp/flow';
import { OutputParams } from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { linkStyle } from '../../components/Typography';
import { useServices } from '../../context/Services';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { ScrollTarget } from '../../navigation/types';
import { createNavigationOptions, navigationOptionsToString } from '../../navigation/utils';
import { AppState, Dispatch } from '../../types';
import showConfirmation from '../highlights/components/utils/showConfirmation';
import {
  hasUnsavedHighlight as hasUnsavedHighlightSelector
} from '../highlights/selectors';
import * as select from '../selectors';
import { Book, SystemQueryParams } from '../types';
import { getBookPageUrlAndParams, stripIdVersion, toRelativeUrl } from '../utils';
import { isClickWithModifierKeys } from '../utils/domUtils';
import { createNavigationMatch } from '../utils/navigationUtils';

interface Props {
  book: Book;
  page: {
    id: string;
    title: string;
  };
  currentBook: Book | undefined;
  onClick?: () => void; // this one gets called before navigation
  handleClick?: () => void; // this one gets called instead of navigation
  navigate: typeof push;
  currentPath: string;
  portalName: string | undefined,
  hasUnsavedHighlight: boolean;
  queryParams?: OutputParams;
  scrollTarget?: ScrollTarget;
  className?: string;
  target?: string;
  myForwardedRef: React.Ref<HTMLAnchorElement>;
  systemQueryParams?: SystemQueryParams;
  ignoreModal?: boolean;
}

// tslint:disable-next-line:variable-name
export const ContentLink = (props: React.PropsWithChildren<Props>) => {
  const {
    book,
    page,
    currentBook,
    currentPath,
    portalName,
    queryParams,
    scrollTarget,
    navigate,
    onClick,
    handleClick,
    children,
    myForwardedRef,
    hasUnsavedHighlight,
    systemQueryParams,
    ...anchorProps
  } = props;

  const {url, params} = getBookPageUrlAndParams(book, page, portalName);
  const navigationMatch = createNavigationMatch(page, book, params);
  const relativeUrl = toRelativeUrl(currentPath, url);
  const bookUid = stripIdVersion(book.id);
  const options = currentBook && currentBook.id === bookUid
    ? createNavigationOptions({...systemQueryParams},
      scrollTarget)
    : undefined;
  const URL = options ? relativeUrl + navigationOptionsToString(options) : relativeUrl;
  const services = useServices();

  return <a
    ref={myForwardedRef}
    onClick={async(e) => {

      if (isClickWithModifierKeys(e) || anchorProps.target === '_blank') {
        return;
      }

      e.preventDefault();

      if (hasUnsavedHighlight && !await showConfirmation(services)) {
        return;
      }

      if (onClick) {
        onClick();
      }

      if (handleClick) {
        handleClick();
      } else {
        navigate(navigationMatch, options);
      }
    }}
    href={URL}
    {...anchorProps}
  >{children}</a>;
};

// tslint:disable-next-line:variable-name
export const ConnectedContentLink = connect(
  (state: AppState, ownProps: {queryParams?: OutputParams}) => ({
    currentBook: select.book(state),
    currentPath: selectNavigation.pathname(state),
    portalName: selectNavigation.portalName(state),
    hasUnsavedHighlight: hasUnsavedHighlightSelector(state),
    systemQueryParams: {
      ...selectNavigation.systemQueryParameters(state),
      ...ownProps.queryParams,
    },
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(ContentLink);

// tslint:disable-next-line:variable-name
export const StyledContentLink = styled(ConnectedContentLink)`
  ${linkStyle}
`;

export default React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof ConnectedContentLink>, 'myForwardedRef'>
>((props, ref) =>
  <ConnectedContentLink {...props} myForwardedRef={ref} />
);
