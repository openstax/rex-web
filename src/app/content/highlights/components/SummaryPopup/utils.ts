import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'querystring';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../utils/urlUtils';

export const createHighlightLink = ({ sourceId, id, anchor: elementId }: Highlight, book?: Book) => {
  const page = book ? findArchiveTreeNodeById(book.tree, sourceId) : undefined;
  const data = { target: JSON.stringify({ id, type: 'highlight', elementId }) };
  const target = queryString.stringify(data) + `#${elementId}`;
  return `${page && book ? getBookPageUrlAndParams(book, page).url : ''}?${target}`;
};
