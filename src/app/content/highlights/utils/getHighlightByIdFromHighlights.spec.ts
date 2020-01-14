import { Highlight } from '@openstax/highlighter/dist/api';
import getHighlightByIdFromHighlights from './getHighlightByIdFromHighlights';

const highlight = { id: 'highlight' } as Highlight;
const highlight2 = { id: 'highlight2' } as Highlight;

describe('getHighlightByIdFromHighlights', () => {
  it('get highlight', () => {
    const highlights = [highlight, highlight2];

    const foundHighlight = getHighlightByIdFromHighlights(highlights, highlight.id);

    expect(foundHighlight).toEqual(highlight);
  });

  it('return undefined if highlight was not found', () => {
    const highlights = [highlight, highlight2];

    const foundHighlight = getHighlightByIdFromHighlights(highlights, 'not-here');

    expect(foundHighlight).toBeUndefined();
  });
});
