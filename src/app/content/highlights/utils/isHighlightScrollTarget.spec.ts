import isHighlightScrollTarget from './isHighlightScrollTarget';

describe('isHighlightScrollTarget', () => {
  it('return true if passed valid data', () => {
    expect(isHighlightScrollTarget({ type: 'highlight', id: 'id', elementId: 'anchor' })).toEqual(true);
  });

  it('return false for invalid data', () => {
    expect(isHighlightScrollTarget({ type: 'search', id: 'id', elementId: 'anchor' })).toEqual(false);
    expect(isHighlightScrollTarget({ type: 'highlight', elementId: 'anchor' })).toEqual(false);
  });
});
