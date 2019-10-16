import { SerializedHighlight } from '@openstax/highlighter';

export interface State {
  enabled: boolean;
  highlights: Array<SerializedHighlight['data']>;
}
