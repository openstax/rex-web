import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';

export interface State {
  isEnabled: boolean;
  summary: {
    filters: {
      colors: HighlightColorEnum[];
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
