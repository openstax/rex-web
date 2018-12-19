import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { push } from '../../navigation/actions';
import { Dispatch } from '../../types';
import { content } from '../routes';
import { ArchiveTree } from '../types';
import { getIdVersion, getUrlParamForPageId, stripIdVersion } from '../utils';

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  book: {
    id: string;
    shortId: string;
    tree: ArchiveTree;
    title: string;
    version?: string;
  };
  page: {
    id: string;
    shortId: string;
    title: string;
  };
  navigate: typeof push;
  className?: string;
}

// tslint:disable-next-line:variable-name
export const ContentLink: SFC<Props> = ({book, page, navigate, ...props}) => {
  const params = {
    bookId: stripIdVersion(book.shortId),
    page: getUrlParamForPageId(book, page.shortId),
  };

  const url = content.getUrl(params);
  const bookVersion = book.version || getIdVersion(book.id);

  if (!bookVersion) {
    // tslint:disable-next-line:no-console
    console.error('BUG: ContentLink was not provided with book version for target content');
  }

  const state = bookVersion
    ? {bookUid: stripIdVersion(book.id), pageUid: stripIdVersion(page.id), bookVersion}
    : undefined;

  return <a
    onClick={(e) => {
      e.preventDefault();
      navigate({
        params,
        route: content,
        state,
      });
    }}
    href={url}
    {...props}
  />;
};

export default connect(
  () => ({}),
  (dispatch: Dispatch): {navigate: typeof push} => ({
    navigate: (...args) => dispatch(push(...args)),
  })
)(ContentLink);
