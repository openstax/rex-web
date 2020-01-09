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
export interface HighlightsTotalCountsPerPage {
  [pageId: string]: number;
}
export interface HighlightsTotalCountsPerLocation {
  [locationId: string]: number;
}

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    totalCountsPerLocation: HighlightsTotalCountsPerLocation,
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights;
  };
  totalCountsPerPage: HighlightsTotalCountsPerPage | null;
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
