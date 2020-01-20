import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { book } from '../../../../test/mocks/archiveLoader';
import { CountsPerSource } from '../types';
import { getHighlightLocationFilters, getHighlightLocationFiltersWithContent } from '../utils';

describe('getHighlightLocationFiltersWithContent', () => {
  it('should return a set of locationFilterIds with content', () => {
    const totalCountsPerPage = {
      'testbook1-testpage1-uuid': {
        [HighlightColorEnum.Green]: 1,
      },
      'testbook1-testpage2-uuid': {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      'testbook1-testpage4-uuid': {
        [HighlightColorEnum.Blue]: 2,
        [HighlightColorEnum.Green]: 2,
        [HighlightColorEnum.Pink]: 1,
      },
    } as CountsPerSource;
    const filterLocations = getHighlightLocationFilters(book);

    const expectedResult = new Map([
      ['testbook1-testpage1-uuid', {
        [HighlightColorEnum.Green]: 1,
      }],
      ['testbook1-testchapter1-uuid', {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 2,
        [HighlightColorEnum.Yellow]: 1,
      }],
      ['testbook1-testchapter3-uuid', {
        [HighlightColorEnum.Blue]: 2,
        [HighlightColorEnum.Green]: 2,
        [HighlightColorEnum.Pink]: 1,
      }],
    ]);

    expect(getHighlightLocationFiltersWithContent(filterLocations, totalCountsPerPage)).toEqual(expectedResult);
  });
});
