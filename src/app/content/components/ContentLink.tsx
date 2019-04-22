import flow from 'lodash/fp/flow';
import React, { SFC } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { linkStyle } from '../../components/Typography';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { AppState, Dispatch } from '../../types';
import { content } from '../routes';
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
  className?: string;
}

// tslint:disable-next-line:variable-name
export const ContentLink: SFC<Props> = ({book, page, currentPath, navigate, onClick, ...props}) => {
  const {url, params} = getBookPageUrlAndParams(book, page);
  const relativeUrl = toRelativeUrl(currentPath, url);

  return <a
    onClick={(e) => {
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
