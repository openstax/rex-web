import {
  CountsPerSource,
  HighlightData,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../types';

export interface State {
  highlights: null | HighlightData[];
  isEnabled: boolean;
  summary: {
    loading: boolean,
    open: boolean,
    pagination: SummaryHighlightsPagination,
    highlights: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource | null;
  };
}
