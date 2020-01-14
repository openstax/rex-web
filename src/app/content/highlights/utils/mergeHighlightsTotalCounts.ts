import { assertDefined } from '../../../utils';
import { ArchiveBook, Book } from '../../types';
import { HighlightsTotalCountsPerLocation, HighlightsTotalCountsPerPage } from '../types';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';
import getHighlightLocationFilters from './getHighlightLocationFilters';
import reduceColorCounts from './reduceColorCounts';

const mergeHighlightsTotalCounts = (book: ArchiveBook | Book, totalCounts: HighlightsTotalCountsPerPage) => {
  const locationFilters = getHighlightLocationFilters(book);
  const totalCountsPerLocation: HighlightsTotalCountsPerLocation = {};

  for (const [pageId, counts] of Object.entries(totalCounts)) {
    const location = assertDefined(
      getHighlightLocationFilterForPage(locationFilters, pageId),
      `Couldn't find locationId for ${pageId} in book ${book.title}`);
    if (typeof totalCountsPerLocation[location.id] === 'number') {
      totalCountsPerLocation[location.id] = reduceColorCounts(counts, totalCountsPerLocation[location.id]);
    } else {
      totalCountsPerLocation[location.id] = counts;
    }
  }

  return totalCountsPerLocation;
};

export default mergeHighlightsTotalCounts;
