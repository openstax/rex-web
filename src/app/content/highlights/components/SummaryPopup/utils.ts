import { Highlight } from '@openstax/highlighter/dist/api';
import { generateTargetQueryFromScrollTarget } from '../../../../navigation/utils';
import { Book } from '../../../types';
import { findArchiveTreeNode } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../utils/urlUtils';

export const createHighlightLink = ({ sourceId, id, anchor: elementId }: Highlight, book?: Book) => {
  const page = book ? findArchiveTreeNode(book.tree, sourceId) : undefined;
  const target = generateTargetQueryFromScrollTarget({ id, type: 'highlight', elementId });
  return `${page && book ? getBookPageUrlAndParams(book, page).url : ''}?${target}`;
};
