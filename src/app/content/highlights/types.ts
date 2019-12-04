import { Highlight } from '@openstax/highlighter/dist/api';

export type HighlightData = Highlight;

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
}
