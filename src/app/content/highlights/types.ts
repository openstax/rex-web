import { SerializedHighlight } from '@openstax/highlighter';

export type HighlightData = SerializedHighlight['data'] & {
  note?: string;
};

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: HighlightData[];
}
