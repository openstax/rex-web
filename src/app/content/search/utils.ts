import { SearchResult } from '@openstax/open-search-client';
import { Location } from 'history';
import sortBy from 'lodash/fp/sortBy';
import { RouteState } from '../../navigation/types';
import { content } from '../routes';
import { ArchiveTree, ArchiveTreeSection, LinkedArchiveTree, LinkedArchiveTreeNode } from '../types';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage, linkArchiveTree } from '../utils/archiveTreeUtils';
import { getIdVersion, stripIdVersion } from '../utils/idUtils';
import { isSearchResultChapter } from './guards';
import { SearchResultContainer, SearchResultPage, SelectedResult } from './types';

export const getFirstResult = (book: {tree: ArchiveTree}, results: SearchResult): SelectedResult | null => {
  const [result] = getFormattedSearchResults(book.tree, results);
  const findFirstResultPage = (container: SearchResultContainer): SearchResultPage => isSearchResultChapter(container)
    ? findFirstResultPage(container.contents[0])
    : container;

  const firstResultPage = result && findFirstResultPage(result);
  const firstResult = firstResultPage && firstResultPage.results[0];

  if (firstResult) {
    return {result: firstResult, highlight: 0};
  }

  return null;
};

export const getFormattedSearchResults = (bookTree: ArchiveTree, searchResults: SearchResult) =>
  filterTreeForSearchResults(linkArchiveTree(bookTree), searchResults);

const getSearchResultsForPage = (page: ArchiveTreeSection, results: SearchResult) => sortBy('source.pagePosition',
  results.hits.hits.filter((result) => stripIdVersion(result.source.pageId) ===  stripIdVersion(page.id))
);

const filterTreeForSearchResults = (
  node: LinkedArchiveTree,
  searchResults: SearchResult
): SearchResultContainer[]  => {
  const containers: SearchResultContainer[] = [];
  const linkContents = (parent: LinkedArchiveTree): LinkedArchiveTreeNode[] =>
    parent.contents.map((child) => ({...child, parent}));

  for (const child of linkContents(node)) {
    if (archiveTreeSectionIsPage(child)) {
      const results = getSearchResultsForPage(child, searchResults);

      if (results.length > 0) {
        containers.push({...child, results});
      }
    } else if (archiveTreeSectionIsChapter(child)) {
      const contents = filterTreeForSearchResults(child, searchResults);

      if (contents.length > 0) {
        containers.push({...child, contents});
      }
    } else { // must be an non-chapter ArchiveTree
      containers.push(...filterTreeForSearchResults(child, searchResults));
    }
  }

  return containers;
};

export const getIndexData = (indexName: string) => {
  const tail = getIdVersion(indexName);

  if (!tail) {
    throw new Error(`impropertly formatted index string: "${indexName}"`);
  }

  const [version, indexingStrategy] = tail.split('_');

  return {
    bookId: stripIdVersion(indexName),
    indexingStrategy,
    version,
  };
};

export const getSearchFromLocation = (location: Location): RouteState<typeof content>['search'] =>
  location.state && location.state.search;
