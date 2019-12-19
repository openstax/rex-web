import { book, page, pageInChapter } from '../../../test/mocks/archiveLoader';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage } from '../utils/archiveTreeUtils';
import {
  getHighlightLocationForPage,
  getHighlightLocationsFromBook,
} from './utils';

describe('getHighlightLocationForPage', () => {
  it('should not return anything for page which is not in book', () => {
    const locations = getHighlightLocationsFromBook(book);
    const location = getHighlightLocationForPage(locations, {...pageInChapter, id: 'not-in-book' });
    expect(location).toBeUndefined();
  });

  it('should return chapter for page in chapter', () => {
    const locations = getHighlightLocationsFromBook(book);
    const location = getHighlightLocationForPage(locations, pageInChapter);
    expect(location!.id).toEqual('testbook1-testchapter5-uuid');
  });

  it('should return page for page directly in book tree (Preface)', () => {
    const locations = getHighlightLocationsFromBook(book);
    const location = getHighlightLocationForPage(locations, page);
    expect(location!.id).toEqual(page.id);
  });
});

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
