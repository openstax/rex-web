import { HighlightsSummary } from '@openstax/highlighter/dist/api';

export interface State {
  isEnabled: boolean;
  summary: HighlightsSummary | null;
}
