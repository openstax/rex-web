import { HighlightLocationFilters, HighlightsTotalCountsPerPage } from '../types';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';

export default (locationFilters: HighlightLocationFilters, totalCounts: HighlightsTotalCountsPerPage) => {

  return Object.entries(totalCounts).reduce((result, [pageId]) => {
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);

    if (location && !result.has(location.id)) {
      result.add(location.id);
    }

    return result;
  }, new Set<string>());
};
