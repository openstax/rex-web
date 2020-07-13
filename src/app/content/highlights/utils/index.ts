import { ScrollTarget } from '../../../navigation/types';
import { HighlightScrollTarget } from '../types';

export {
  getHighlightLocationFilters,
  getHighlightColorFiltersWithContent,
  getHighlightLocationFilterForPage,
  getHighlightLocationFiltersWithContent,
  sectionIsHighlightLocationFitler
} from './locationFiltersUtils';

export {
  addToTotalCounts,
  updateInTotalCounts,
  removeFromTotalCounts,
  addSummaryHighlight,
  getHighlightByIdFromSummaryHighlights,
  removeSummaryHighlight,
  updateSummaryHighlight,
  updateSummaryHighlightsDependOnFilters,
  getSortedSummaryHighlights
} from './summaryHighlightsUtils';

export const isHighlightScrollTarget = (target: ScrollTarget): target is HighlightScrollTarget => {
  if (target.type === 'highlight' && typeof target.id === 'string') { return true; }
  return false;
};
