import { assertDefined } from '../../../utils';
import { ArchiveBook, Book } from '../../types';
import { CountsPerSource } from '../types';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';
import getHighlightLocationFilters from './getHighlightLocationFilters';

/*
 * aggregates highlight counts per page by filter location
 */
const mergeHighlightsTotalCounts = (book: ArchiveBook | Book, totalCounts: CountsPerSource) => {
  const locationFilters = getHighlightLocationFilters(book);
  const totalCountsPerLocation: CountsPerSource = {};

  for (const [pageId, counts] of Object.entries(totalCounts)) {
    const location = assertDefined(
      getHighlightLocationFilterForPage(locationFilters, pageId),
      `Couldn't find locationId for ${pageId} in book ${book.title}`);
    if (typeof totalCountsPerLocation[location.id] === 'number') {
      totalCountsPerLocation[location.id] += counts;
    } else {
      totalCountsPerLocation[location.id] = counts;
    }
  }

  return totalCountsPerLocation;
};

export default mergeHighlightsTotalCounts;
