import { SerializedHighlight } from '@openstax/highlighter';

export type HighlightData = SerializedHighlight['data'] & {
  note?: string;
};

export interface State {
  enabled: boolean;
  focused?: string;
  highlights: HighlightData[];
}
