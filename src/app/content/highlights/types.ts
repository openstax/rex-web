import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';

export type HighlightData = Highlight;
export interface SummaryHighlights {
  [sectionId: string]: {[pageId: string]: HighlightData[]};
}
export interface SummaryFilters {
  chapters: string[];
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
