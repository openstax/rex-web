import {
  CountsPerSource,
  HighlightData,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';

export interface State {
  studyGuides: null | HighlightData[];
  isEnabled: boolean;
  summary: {
    loading: boolean,
    open: boolean,
    pagination: SummaryHighlightsPagination,
    studyGuides: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource | null;
  };
}
