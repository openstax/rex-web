import { isPlainObject } from '../../guards';
import { isScrollTarget } from '../../navigation/utils';
import { isArchiveTree } from '../guards';
import { SearchResultChapter, SearchResultContainer, SearchScrollTarget } from './types';

export const isSearchResultChapter = (container: SearchResultContainer): container is SearchResultChapter =>
  isArchiveTree(container);

export const isSearchScrollTarget = (target: any): target is SearchScrollTarget => isPlainObject(target)
  && isScrollTarget(target)
  && target.type === 'search'
  && typeof target.index === 'number';
