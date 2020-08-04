import { ScrollTarget } from '../../navigation/types';
import { isArchiveTree } from '../guards';
import { SearchResultChapter, SearchResultContainer, SearchScrollTarget } from './types';

export const isSearchResultChapter = (container: SearchResultContainer): container is SearchResultChapter =>
  isArchiveTree(container);

export const isSearchScrollTarget = (target: ScrollTarget): target is SearchScrollTarget => {
  return target.type === 'search' && typeof target.index === 'number';
};
