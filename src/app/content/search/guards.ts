import { SearchResultHit, SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client';
import { ScrollTarget } from '../../navigation/types';
import { isArchiveTree } from '../guards';
import { ArchiveTree, ArchiveTreeNode } from '../types';
import { KeyTermHit, SearchResultChapter, SearchResultContainer, SearchResultPage, SearchScrollTarget } from './types';

export const isSearchResultChapter = (container: SearchResultContainer): container is SearchResultChapter =>
  isArchiveTree(container);

export const isSearchResultPage = (section: ArchiveTreeNode | ArchiveTree): section is SearchResultPage =>
  (section as SearchResultPage).results !== undefined;

export const isSearchScrollTarget = (target: ScrollTarget): target is SearchScrollTarget => {
  return target.type === 'search' && typeof target.index === 'number';
};

export const isKeyTermHit = (hit: SearchResultHit): hit is KeyTermHit => {
  return hit.source.elementType === SearchResultHitSourceElementTypeEnum.KeyTerm;
};
