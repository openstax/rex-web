import { SerializedHighlight } from '@openstax/highlighter';

export interface State {
  enabled: boolean;
  focused?: string;
  highlights: Array<SerializedHighlight['data']>;
}
