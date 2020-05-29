import { HighlightsSummary } from '@openstax/highlighter/dist/api';

export interface State {
  isEnabled: boolean;
  summary: {
    open: boolean,
    studyGuides: HighlightsSummary | null,
  };
}
