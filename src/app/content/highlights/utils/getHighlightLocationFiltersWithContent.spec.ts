import { book } from '../../../../test/mocks/archiveLoader';
import { getHighlightLocationFilters, getHighlightLocationFiltersWithContent } from '../utils';

describe('getHighlightLocationFiltersWithContent', () => {
  it('should merge total counts per page to their locationFilterId', () => {
    const totalCountsPerPage = {
      'testbook1-testpage1-uuid': {},
      'testbook1-testpage2-uuid': {},
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': {},
      'testbook1-testpage4-uuid': {},
    };
    const filterLocations = getHighlightLocationFilters(book);

    const expectedResult = new Set([
      'testbook1-testpage1-uuid',
      'testbook1-testchapter1-uuid',
      'testbook1-testchapter3-uuid',
    ]);

    expect(getHighlightLocationFiltersWithContent(filterLocations, totalCountsPerPage)).toEqual(expectedResult);
  });
});
