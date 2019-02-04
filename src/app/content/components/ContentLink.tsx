import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { AppState, Dispatch } from '../../types';
import { content } from '../routes';
import { Book } from '../types';
import { getUrlParamForPageId, stripIdVersion, toRelativeUrl } from '../utils';

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  book: Book;
  page: {
    id: string;
    shortId: string;
    title: string;
  };
  navigate: typeof push;
  currentPath: string;
  className?: string;
}

// tslint:disable-next-line:variable-name
export const ContentLink: SFC<Props> = ({book, page, currentPath, navigate, ...props}) => {
  const params = {
    book: book.slug,
    page: getUrlParamForPageId(book, page.shortId),
  };

  const url = toRelativeUrl(currentPath, content.getUrl(params));

  return <a
    onClick={(e) => {
      e.preventDefault();
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
    href={url}
    {...props}
  />;
};

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
  }),
  (dispatch: Dispatch): {navigate: typeof push} => ({
    navigate: (...args) => dispatch(push(...args)),
  })
)(ContentLink);
