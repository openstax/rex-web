import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import reduceColorCounts from './reduceColorCounts';

describe('reduceColorCounts', () => {
  it('reduce color counts', () => {
    const colorCounts = {
      [HighlightColorEnum.Blue]: 1,
      [HighlightColorEnum.Yellow]: 2,
    };

    const otherColorCounts = {
      [HighlightColorEnum.Blue]: 3,
      [HighlightColorEnum.Pink]: 1,
      [HighlightColorEnum.Yellow]: 2,
    };

    const expectedResult = {
      [HighlightColorEnum.Blue]: 4,
      [HighlightColorEnum.Pink]: 1,
      [HighlightColorEnum.Yellow]: 4,
    };

    expect(reduceColorCounts(colorCounts, otherColorCounts)).toEqual(expectedResult);
  });
});
