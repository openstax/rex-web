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
export interface ColorCounts {
  [HighlightColorEnum.Blue]: number;
  [HighlightColorEnum.Green]: number;
  [HighlightColorEnum.Pink]: number;
  [HighlightColorEnum.Purple]: number;
  [HighlightColorEnum.Yellow]: number;
}
export interface HighlightsTotalCountsPerPage {
  [pageId: string]: ColorCounts;
}
export interface HighlightsTotalCountsPerLocation {
  [locationId: string]: ColorCounts;
}

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    totalCountsPerPage: HighlightsTotalCountsPerPage | null;
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights;
  };
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
