import { HighlightsSummary } from '@openstax/highlighter/dist/api';

// Temporary until we expand this state with more data
// tslint:disable-next-line: no-empty-interface
export interface StudyGuides extends HighlightsSummary {}

export interface State {
  summary: StudyGuides | null;
}
