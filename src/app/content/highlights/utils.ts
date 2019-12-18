import { Book, LinkedArchiveTreeNode, Page } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  flattenArchiveTree,
} from '../utils/archiveTreeUtils';
import { HighlightLocations } from './types';

export const getHighlightLocationsFromBook = (book: Book) => {
  return new Map(flattenArchiveTree(book.tree).filter((section) =>
    (section.parent && archiveTreeSectionIsBook(section.parent))
    || archiveTreeSectionIsChapter(section)).map((s) => [s.id, s]));
};

export const getHighlightLocationForPage = (locations: HighlightLocations, page: Page | LinkedArchiveTreeNode) => {
  let location = locations.get(page.id);

  if (!location) {
    for (const section of locations.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, page.id)) {
        location = section;
        break;
      }
    }
  }

  return location;
};
