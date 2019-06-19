import flow from 'lodash/fp/flow';
import React, { SFC } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { linkStyle } from '../../components/Typography';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { AppState, Dispatch } from '../../types';
import { content } from '../routes';
import * as selectSearch from '../search/selectors';
import {State as SearchState } from '../search/types';
import { Book } from '../types';
import { getBookPageUrlAndParams, stripIdVersion, toRelativeUrl } from '../utils';

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  book: Book;
  page: {
    id: string;
    shortId: string;
    title: string;
  };
  onClick?: () => void;
  navigate: typeof push;
  currentPath: string;
  search: SearchState['query'];
  className?: string;
}

// tslint:disable-next-line:variable-name
export const ContentLink: SFC<Props> = ({book, page, currentPath, search, navigate, onClick, ...props}) => {
  const {url, params} = getBookPageUrlAndParams(book, page);
  const relativeUrl = toRelativeUrl(currentPath, url);

  return <a
    onClick={(e) => {
      if (e.metaKey) {
        return;
      }
      e.preventDefault();
      if (onClick) {
        onClick();
      }
      navigate({
        params,
        route: content,
        state : {
          bookUid: stripIdVersion(book.id),
          bookVersion: book.version,
          pageUid: stripIdVersion(page.id),
          search, // TODO - only forward search if navigating within the same book
                  // TODO - combine this with logic in Page that handles in content links
        },
      });
    }}
    href={relativeUrl}
    {...props}
  />;
};

// tslint:disable-next-line:variable-name
export const ConnectedContentLink = connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    search: selectSearch.query(state),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(ContentLink);

// tslint:disable-next-line:variable-name
export const StyledContentLink = styled(ConnectedContentLink)`
  ${linkStyle}
`;

export default ConnectedContentLink;
