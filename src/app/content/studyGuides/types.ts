import { Highlight } from '@openstax/highlighter/dist/api';
import { HighlightsSummary } from '@openstax/highlighter/dist/api';
import { LinkedArchiveTreeNode } from '../types';

export type CountsPerSource = NonNullable<HighlightsSummary['countsPerSource']>;
export type StudyGuidesPagination = null | {
  sourceIds: string[];
  page: number;
  perPage: number;
};

export type OrderedSummaryHighlights = Array<{
  location: LinkedArchiveTreeNode,
  pages: Array<{
    pageId: string;
    highlights: Highlight[];
  }>
}>;

export interface StudyGuides {
  [locationId: string]: {[pageId: string]: Highlight[]};
}

export interface State {
  highlights: StudyGuides | null;
  isEnabled: boolean;
  loading: boolean;
  open: boolean;
  pagination: StudyGuidesPagination;
  summary: HighlightsSummary | null;
  totalCountsPerPage: CountsPerSource | null;
}
