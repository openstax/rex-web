import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../types';

export interface State {
  highlights: null;
  isEnabled: boolean;
  loading: boolean;
  open: boolean;
  summary: {
    pagination: SummaryHighlightsPagination,
    highlights: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource;
  };
}
