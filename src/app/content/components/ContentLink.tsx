import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { push } from '../../navigation/actions';
import { Dispatch } from '../../types';
import { content } from '../routes';
import { Book } from '../types';
import { stripIdVersion } from '../utils';

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  book: Book;
  page: {
    shortId: string;
    title: string;
  };
  navigate: typeof push;
  className?: string;
}

// tslint:disable-next-line:variable-name
export const ContentLink: SFC<Props> = ({book, page, navigate, ...props}) => {
  const url = content.getUrl({bookId: book.shortId, pageId: stripIdVersion(page.shortId)});

  return <a
    onClick={(e) => {
      e.preventDefault();
      navigate(url);
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
