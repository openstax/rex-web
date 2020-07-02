import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';

export interface State {
  isEnabled: boolean;
  summary: {
    filters: {
      locationIds: string[];
      default: boolean;
    },
    loading: boolean,
    open: boolean,
    pagination: SummaryHighlightsPagination,
    studyGuides: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource | null;
  };
}
