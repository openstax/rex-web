import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'querystring';
import { assertWindow } from '../../../../utils';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../utils/urlUtils';

export const createHighlightLink = ({ sourceId, id, anchor: elementId }: Highlight, book?: Book) => {
  const page = book ? findArchiveTreeNodeById(book.tree, sourceId) : undefined;
  const data = { target: JSON.stringify({ id, type: 'highlight' }) };
  const target = queryString.stringify(data) + `#${elementId}`;
  // We need assertWindow().origin here because Safari
  // does not want to open links in a new window if they does not have it
  return `${assertWindow().origin}${page && book ? getBookPageUrlAndParams(book, page).url : ''}?${target}`;
};
