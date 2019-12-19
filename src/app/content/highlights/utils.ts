import { ArchiveBook, Book, LinkedArchiveTreeNode, Page } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  flattenArchiveTree,
} from '../utils/archiveTreeUtils';
import { HighlightLocations } from './types';

export const getHighlightLocationsFromBook = (book: Book | ArchiveBook) => {
  return new Map(flattenArchiveTree(book.tree).filter((section) =>
    (section.parent && archiveTreeSectionIsBook(section.parent))
    || archiveTreeSectionIsChapter(section)).map((s) => [s.id, s]));
};

export const getHighlightLocationForPage = (
  locations: HighlightLocations, page: Page | LinkedArchiveTreeNode | string
) => {
  const pageId = typeof page === 'string' ? page : page.id;
  let location = locations.get(pageId);

  if (!location) {
    for (const section of locations.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, pageId)) {
        location = section;
        break;
      }
    }
  }

  return location;
};
