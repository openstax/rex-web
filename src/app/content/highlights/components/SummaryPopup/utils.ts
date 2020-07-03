import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'query-string';
import React from 'react';
import { useSelector } from 'react-redux';
import { book as bookSelector } from '../../../selectors';
import { Book, LinkedArchiveTreeNode, LinkedArchiveTreeSection } from '../../../types';
import { findArchiveTreeNode } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../utils/urlUtils';

const createHighlightLink = (
  { id, anchor }: Highlight,
  page?: LinkedArchiveTreeSection | LinkedArchiveTreeNode,
  book?: Book
) => {
  const search = queryString.stringify({ target: JSON.stringify({ id, type: 'highlight' }) });
  return `${page && book ? getBookPageUrlAndParams(book, page).url : ''}?${search}#${anchor}`;
};

export const useCreateHighlightLink = (highlight: Highlight) => {
  const [link, setLink] = React.useState('');
  const book = useSelector(bookSelector);

  const page = React.useMemo(() => book
    ? findArchiveTreeNode(book.tree, highlight.sourceId)
    : undefined
  , [book, highlight.sourceId]);

  React.useEffect(() => {
    setLink(createHighlightLink(highlight, page, book));
  }, [highlight, page, book]);

  return link;
};
