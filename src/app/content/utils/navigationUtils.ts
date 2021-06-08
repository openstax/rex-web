import { AnyMatch } from '../../navigation/types';
import { content } from '../routes';
import { Book, Params } from '../types';
import { getBookPageUrlAndParams } from '../utils';
import { findArchiveTreeNodeById } from './archiveTreeUtils';
import { stripIdVersion } from './idUtils';

export const createNavigationMatch = (pageId: string, book: Book, params?: Params): AnyMatch | undefined => {
  const page = findArchiveTreeNodeById(book.tree, pageId);
  if (!page) { return; }

  return {
    params: params ? params : getBookPageUrlAndParams(book, page).params,
    route: content,
    state: {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: stripIdVersion(page.id),
    },
  };
};
