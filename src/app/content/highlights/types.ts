import { Highlight, HighlightColorEnum, HighlightsSummary } from '@openstax/highlighter/dist/api';
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../types';

export type HighlightData = Highlight;
export interface SummaryHighlights {
  [locationId: string]: {[pageId: string]: HighlightData[]};
}
export interface SummaryFilters {
  locationIds: string[];
  colors: HighlightColorEnum[];
}

export type CountsPerSource = NonNullable<HighlightsSummary['countsPerSource']>;
export type HighlightColorCounts = CountsPerSource[string];

export type SummaryHighlightsPagination = null | {
  sourceIds: string[];
  page: number;
};

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  hasUnsavedHighlight: boolean;
  shouldShowDiscardModal: boolean;
  highlights: null | HighlightData[];
  summary: {
    pagination: SummaryHighlightsPagination,
    totalCountsPerPage: CountsPerSource | null;
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights | null;
  };
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
