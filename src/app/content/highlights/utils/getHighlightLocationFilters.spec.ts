import { book } from '../../../../test/mocks/archiveLoader';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage } from '../../utils/archiveTreeUtils';
import { getHighlightLocationFilters } from '../utils';

describe('getHighlightLocationFilters', () => {
  it('should return empty map for book without sections', () => {
    const locationFilters = getHighlightLocationFilters({...book, tree: {...book.tree, contents: []} });
    expect(locationFilters.size).toEqual(0);
  });

  it('should return map of chapters and pages', () => {
    const locationFilters = getHighlightLocationFilters(book);
    const onlyPagesAndChapters = Array.from(locationFilters.values())
      .every((location) => archiveTreeSectionIsChapter(location) || archiveTreeSectionIsPage(location));
    expect(onlyPagesAndChapters).toEqual(true);
  });
});
