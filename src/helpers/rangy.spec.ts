import rangy, { RangyRange, TextRange } from 'rangy';
import { mockRange } from '../test/mocks/rangy';
import { findTextInRange } from './rangy';

describe('findTextInRange', () => {
  it('clones every found match', () => {
    const withinRange = mockRange();
    const searchRange = mockRange();

    searchRange.findText
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    searchRange.intersectsRange.mockReturnValue(true);

    const firstMatch = mockRange();
    const secondMatch = mockRange();

    searchRange.cloneRange
      .mockReturnValue(searchRange)
      .mockReturnValueOnce(firstMatch)
      .mockReturnValueOnce(secondMatch);

    (rangy.createRange as unknown as jest.SpyInstance).mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange & TextRange, 'cool text');

    expect(result.length).toBe(2);
    expect(result[0]).toBe(firstMatch);
    expect(result[1]).toBe(secondMatch);
  });
});
