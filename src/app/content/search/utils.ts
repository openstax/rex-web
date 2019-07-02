import { SearchResult } from '@openstax/open-search-client';
import { Location } from 'history';
import sortBy from 'lodash/fp/sortBy';
import { isArchiveTree } from '../guards';
import { ArchiveTreeSection, Book, LinkedArchiveTree, LinkedArchiveTreeNode } from '../types';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage } from '../utils/archiveTreeUtils';
import { getIdVersion, stripIdVersion } from '../utils/idUtils';
import { isSearchResultChapter } from './guards';
import { SearchResultContainer, SearchResultPage } from './types';

export const getFirstResultPage = (book: Book, results: SearchResult): SearchResultPage | undefined => {
  const [result] = filterTreeForSearchResults(book.tree, results);
  const getFirstResult = (container: SearchResultContainer): SearchResultPage => isSearchResultChapter(container)
    ? getFirstResult(container.contents[0])
    : container;

  return result && getFirstResult(result);
};

const getSearchResultsForPage = (page: ArchiveTreeSection, results: SearchResult) => sortBy('source.pagePosition',
  results.hits.hits
    ?  results.hits.hits.filter((result) => stripIdVersion(result.source.pageId) ===  stripIdVersion(page.id))
    : []
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
    } else if (isArchiveTree(node)) {
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

export const getSearchFromLocation = (location: Location) => location.state && location.state.search;
