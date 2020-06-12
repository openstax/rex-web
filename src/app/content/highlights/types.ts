import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import {
  CountsPerSource,
  HighlightData,
  SummaryHighlights,
  SummaryHighlightsPagination
} from '../types';

export interface SummaryFilters {
  locationIds: string[];
  colors: HighlightColorEnum[];
}

export interface State {
  currentPage: {
    pageId: string | null,
    highlights: null | HighlightData[];
    hasUnsavedHighlight: boolean;
    focused?: string;
  };
  summary: {
    open: boolean,
    pagination: SummaryHighlightsPagination,
    totalCountsPerPage: CountsPerSource | null;
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights | null;
  };
}
