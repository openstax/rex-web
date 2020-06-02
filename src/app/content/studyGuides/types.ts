import { HighlightsSummary } from '@openstax/highlighter/dist/api';

export interface State {
  isEnabled: boolean;
  open: boolean;
  summary: HighlightsSummary | null;
}
