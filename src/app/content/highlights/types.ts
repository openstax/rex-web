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

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    filters: SummaryFilters,
    loading: boolean;
    chapterCounts: {[key: string]: number};
    highlights: SummaryHighlights;
  };
}

export type HighlightLocations = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
