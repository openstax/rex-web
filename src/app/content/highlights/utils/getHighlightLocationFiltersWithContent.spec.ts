import { book } from '../../../../test/mocks/archiveLoader';
import { getHighlightLocationFilters, getHighlightLocationFiltersWithContent } from '../utils';

describe('getHighlightLocationFiltersWithContent', () => {
  it('should merge total counts per page to their locationFilterId', () => {
    const totalCountsPerPage = {
      'testbook1-testpage1-uuid': 1,
      'testbook1-testpage2-uuid': 2,
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': 1,
      'testbook1-testpage4-uuid': 5,
    };
    const filterLocations = getHighlightLocationFilters(book);

    const expectedResult = new Map([
      ['testbook1-testpage1-uuid', filterLocations.get('testbook1-testpage1-uuid')],
      ['testbook1-testchapter1-uuid', filterLocations.get('testbook1-testchapter1-uuid')],
      ['testbook1-testchapter3-uuid', filterLocations.get('testbook1-testchapter3-uuid')],
    ]);

    expect(getHighlightLocationFiltersWithContent(filterLocations, totalCountsPerPage)).toEqual(expectedResult);
  });
});
