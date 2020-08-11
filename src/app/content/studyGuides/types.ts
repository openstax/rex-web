import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';

export interface StudyGuidesSummaryFilters {
  default: boolean;
  locationIds: string[];
}

export interface State {
  isEnabled: boolean;
  summary: {
    filters: StudyGuidesSummaryFilters,
    loading: boolean,
    open: boolean,
    pagination: SummaryHighlightsPagination,
    studyGuides: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource | null;
  };
}
