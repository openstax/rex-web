import { SearchResult, SearchResultHit } from '../../../clients/open-search';
import { ScrollTarget } from '../../navigation/types';
import { ArchiveTree, ArchiveTreeSection } from '../types';

export interface State {
  loading: boolean;
  mobileToolbarOpen: boolean;
  query: null | string;
  results: SearchResult | null;
  selectedResult: SelectedResult | null;
  sidebarOpen: boolean;
}

export interface SelectedResult {
  result: SearchResultHit;
  highlight: number;
}

export type SearchResultPage = ArchiveTreeSection & {
  results: SearchResultHit[];
};

export type SearchResultChapter = ArchiveTree & {
  contents: Array<SearchResultChapter | SearchResultPage>;
};

export type SearchResultContainer = SearchResultPage | SearchResultChapter;

export interface SearchScrollTarget extends ScrollTarget {
  type: 'search';
  index: number;
}
