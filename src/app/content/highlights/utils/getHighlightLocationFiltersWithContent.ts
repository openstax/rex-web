import { HighlightColorCounts, HighlightLocationFilters, HighlightsTotalCountsPerPage } from '../types';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';
import reduceColorCounts from './reduceColorCounts';

export default (locationFilters: HighlightLocationFilters, totalCounts: HighlightsTotalCountsPerPage) => {

  return Object.entries(totalCounts).reduce((result, [pageId, colorCounts]) => {
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);

    if (location) {
      result.set(location.id, reduceColorCounts(result.get(location.id) || {}, colorCounts));
    }

    return result;
  }, new Map<string, HighlightColorCounts>());
};
