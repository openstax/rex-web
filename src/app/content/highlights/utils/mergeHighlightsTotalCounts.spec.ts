import { book } from '../../../../test/mocks/archiveLoader';
import { mergeHighlightsTotalCounts } from '../utils';

describe('mergeHighlightsTotalCounts', () => {
  it('should merge total counts per page to their locationFilterId', () => {
    const totalCountsPerPage = {
      'testbook1-testpage1-uuid': 1,
      'testbook1-testpage2-uuid': 2,
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': 1,
      'testbook1-testpage4-uuid': 5,
    };

    const expectedResult = {
      'testbook1-testpage1-uuid': 1,
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testchapter1-uuid': 3,
      'testbook1-testchapter3-uuid': 5,
    };

    expect(mergeHighlightsTotalCounts(book, totalCountsPerPage)).toEqual(expectedResult);
  });
});
