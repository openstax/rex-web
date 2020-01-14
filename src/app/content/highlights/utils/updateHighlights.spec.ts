import { Highlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { updateHighlights } from '../utils';

const highlight1 = { id: 'highlight1', color: 'green' } as Highlight;
const highlight2 = { id: 'highlight2' } as Highlight;
const mockUpdateData = {
  highlight: {
    annotation: 'test',
    color: 'yellow',
  },
  id: highlight1.id,
} as UpdateHighlightRequest;

describe('updateHighlights', () => {
  it('update highlight', () => {
    const highlights = [highlight1, highlight2];
    const updatedHighlights = updateHighlights(highlights, mockUpdateData);
    const expectedOutput = [{...highlight1, ...mockUpdateData.highlight}, highlight2];
    expect(updatedHighlights).toEqual(expectedOutput);
  });

  it('noops if highlight can\'t be found', () => {
    const highlights = [highlight1, highlight2];
    const updatedHighlights = updateHighlights(highlights, {...mockUpdateData, id: 'not-found'});
    expect(updatedHighlights).toEqual(highlights);
  });
});
