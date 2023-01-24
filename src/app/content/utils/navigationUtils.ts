import { AnyMatch } from '../../navigation/types';
import { content } from '../routes';
import { Book, Page, Params } from '../types';
import { getBookPageUrlAndParams } from '../utils';

export const createNavigationMatch = (page: Pick<Page, 'id' | 'title'>, book: Book, params?: Params): AnyMatch => {
  return {
    params: params ? params : getBookPageUrlAndParams(book, page).params,
    route: content,
    state: { },
  };
};
