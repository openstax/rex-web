import { Highlight, HighlightsSummary } from '@openstax/highlighter/dist/api';

export type HighlightData = Highlight;

export type CountsPerSource = Exclude<HighlightsSummary['countsPerSource'], undefined>;

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    filters: {
      colors: string[];
      chapters: string[];
    },
    loading: boolean;
    // totalCounts should reflect the UNFILTERED state of user's data, used in representing
    // available filter options. this should be updated on create/delete and after auth change
    totalCounts: {[key: string]: number};
    // filteredTotalCounts should reflect the FILTERED state of user's data, used in calculating
    // pagination requests. this should be updated after filter change before requesting
    // filtered highlights (because you need this to query them)
    filteredTotalCounts: {[key: string]: number};
    highlights: {
      [chapterId: string]: {[pageId: string]: HighlightData[]}
    };
  };
}
