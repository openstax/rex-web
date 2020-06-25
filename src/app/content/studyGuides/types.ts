import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../types';

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

export type StudyGuidesLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
