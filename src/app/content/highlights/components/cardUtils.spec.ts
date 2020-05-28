import { Highlight } from '@openstax/highlighter';
import { getHighlightTopOffset } from './cardUtils';

describe('cardUtils', () => {
  it('returns undefined if passed container is undefined', () => {
    expect(getHighlightTopOffset(undefined, { id: 'asd' } as Highlight)).toBeUndefined();
  });
});
