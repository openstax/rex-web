import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import getHighlightColorFiltersWithContent from './getHighlightColorFiltersWithContent';

describe('getHighlightColorFiltersWithContent', () => {
  it('should return only color filters which have highlights', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: undefined,
        [HighlightColorEnum.Pink]: undefined,
        [HighlightColorEnum.Purple]: undefined,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: undefined,
        [HighlightColorEnum.Green]: undefined,
        [HighlightColorEnum.Purple]: undefined,
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

  it('returns all colors', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
      location3: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    };

    const expectedResult = new Set([
      HighlightColorEnum.Blue,
      HighlightColorEnum.Green,
      HighlightColorEnum.Purple,
      HighlightColorEnum.Pink,
      HighlightColorEnum.Yellow,
    ]);

    expect(getHighlightColorFiltersWithContent(totalCounts)).toEqual(expectedResult);
  });

  it('should return empty set if no matching colors were found', () => {
    expect(getHighlightColorFiltersWithContent({})).toEqual(new Set());
  });
});
