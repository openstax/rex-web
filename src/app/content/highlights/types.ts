import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../types';

export type HighlightData = Highlight;
export interface SummaryHighlights {
  [locationId: string]: {[pageId: string]: HighlightData[]};
}
export interface SummaryFilters {
  locationIds: string[];
  colors: HighlightColorEnum[];
}
export type HighlightColorCounts = Partial<{
  [color in HighlightColorEnum]: number
}>;
export interface CountsPerSource {
  [sourceId: string]: HighlightColorCounts;
}

export type SummaryHighlightsPagination = null | {
  sourceIds: string[];
  page: number;
};

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    pagination: SummaryHighlightsPagination,
    totalCountsPerPage: CountsPerSource | null;
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights;
  };
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
