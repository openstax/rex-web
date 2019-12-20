import { book } from '../../../../test/mocks/archiveLoader';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage } from '../../utils/archiveTreeUtils';
import { getHighlightLocationsFromBook } from '../utils';

describe('getHighlightLocationsFromBook', () => {
  it('should return empty map for book without sections', () => {
    const locations = getHighlightLocationsFromBook({...book, tree: {...book.tree, contents: []} });
    expect(locations.size).toEqual(0);
  });

  it('should return map of chapters and pages', () => {
    const locations = getHighlightLocationsFromBook(book);
    const onlyPagesAndChapters = Array.from(locations.values())
      .every((location) => archiveTreeSectionIsChapter(location) || archiveTreeSectionIsPage(location));
    expect(onlyPagesAndChapters).toEqual(true);
  });
});
