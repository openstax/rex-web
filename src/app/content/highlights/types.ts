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

export type CountsPerSource = Exclude<HighlightsSummary['countsPerSource'], undefined>;

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  // totalCountsPerPage reflects the UNFILTERED state of user's data, used in representing
  // available filter options. this should be updated on create/delete highlight
  totalCountsPerPage: CountsPerSource;
  summary: {
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
    filters: SummaryFilters;
    // filteredCountsPerPage reflects the FILTERED total counts, used to know which sources have
    // more content for pagination
    filteredCountsPerPage: CountsPerSource;
    loading: boolean;
    highlights: SummaryHighlights;
  };
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
