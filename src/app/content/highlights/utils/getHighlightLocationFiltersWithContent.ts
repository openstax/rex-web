import { ArchiveBook, BookWithOSWebData } from '../../types';
import { comparePositionsOfNodes } from '../../utils/archiveTreeUtils';
import { CountsPerSource, HighlightLocationFilters } from '../types';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';

export default (
  locationFilters: HighlightLocationFilters,
  totalCounts: CountsPerSource,
  book?: BookWithOSWebData | ArchiveBook
) => {
  if (!book) { return new Set<string>(); }

  const locationIds = Object.entries(totalCounts).reduce((result, [pageId]) => {
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);

    if (location && !result.has(location.id)) {
      result.add(location.id);
    }

    return result;
  }, new Set<string>());

  const sortedLocationIds = Array.from(locationIds).sort((idA: string, idB: string) => {
    return comparePositionsOfNodes(book.tree, idA, idB);
  });

  return new Set(sortedLocationIds);
};
