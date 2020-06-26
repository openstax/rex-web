import {
  CountsPerSource,
  SummaryFilters,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';

export interface State {
  isEnabled: boolean;
  summary: {
    filters: SummaryFilters,
    loading: boolean,
    open: boolean,
    pagination: SummaryHighlightsPagination,
    studyGuides: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource | null;
  };
}
