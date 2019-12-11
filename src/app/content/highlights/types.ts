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
    pagination: {
      // even though we're manually splitting our requests out into smaller batches of sources,
      // if a source has more than [numPage] highlights the api will still paginate. in order to
      // access the subsequent pages, we need to store the original sources here, and continue to
      // use them until we run out of pages, then grab the next batch of sources. on the LAST
      // page the response size may be smaller than expected, in this case the next batch of
      // sources should be immediately queried to fill the remaining [numPage]. use
      // paginationUtils.getNextPageSources to get the next batch of sources
      sources: string[];
      page: number;
    } | null,
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
