import { SearchResult } from '@openstax/open-search-client';
import { Location } from 'history';
import sortBy from 'lodash/fp/sortBy';
import { ArchiveTreeSection, Book } from '../types';
import { findTreePages } from '../utils/archiveTreeUtils';
import { getIdVersion, stripIdVersion } from '../utils/idUtils';

export const getFirstSearchResult = (book: Book, results: SearchResult) => {
  const sortedResults = getSearchResultsByPage(book, results);

  if (sortedResults.length > 0) {
    return {
      firstResult: sortedResults[0].results[0],
      firstResultPage: sortedResults[0].page,
    };
  }

  return {firstResult: null, firstResultPage: null};
};

const getSearchResultsForPage = (page: ArchiveTreeSection, results: SearchResult) => results.hits.hits
  ? results.hits.hits.filter((result) => stripIdVersion(result.source.pageId) ===  stripIdVersion(page.id))
  : [];

export const getSearchResultsByPage = (book: Book, allResults: SearchResult) => findTreePages(book.tree)
  .map((page) => ({
    page,
    results: sortBy('source.pagePosition', getSearchResultsForPage(page, allResults)),
  }))
  .filter(({results}) => results.length > 0);

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
