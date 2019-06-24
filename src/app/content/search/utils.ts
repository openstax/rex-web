import { SearchResult } from '@openstax/open-search-client';
import { getIdVersion, stripIdVersion } from '../utils/idUtils';

// TODO - sort by page order
// TODO - sort by `pagePosition`
export const getFirstSearchResult = (results: SearchResult) => {
  return results.hits.hits && results.hits.hits[0];
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
