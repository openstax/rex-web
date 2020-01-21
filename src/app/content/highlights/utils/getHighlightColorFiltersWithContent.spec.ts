import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import getHighlightColorFiltersWithContent from './getHighlightColorFiltersWithContent';

describe('getHighlightColorFiltersWithContent', () => {
  it('should return only color filters which have highlights', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    };

    const expectedResult = new Set([
      HighlightColorEnum.Blue,
      HighlightColorEnum.Green,
      HighlightColorEnum.Pink,
      HighlightColorEnum.Yellow,
    ]);

    expect(getHighlightColorFiltersWithContent(totalCounts)).toEqual(expectedResult);
  });

  it('should return empty set if no matching colors were found', () => {
    expect(getHighlightColorFiltersWithContent({})).toEqual(new Set());
  });
});
