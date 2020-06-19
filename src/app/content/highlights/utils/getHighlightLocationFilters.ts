import { ArchiveBook, Book } from '../../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  flattenArchiveTree,
} from '../../utils/archiveTreeUtils';
import { HighlightLocationFilters } from '../types';

const getHighlightLocationFilters = (book: Book | ArchiveBook | undefined) => {
  return !book
    ? new Map() as HighlightLocationFilters
    : new Map(
      flattenArchiveTree(book.tree)
        .filter((section) =>
          (archiveTreeSectionIsPage(section) && archiveTreeSectionIsBook(section.parent))
          || (archiveTreeSectionIsChapter(section) && !archiveTreeSectionIsUnit(section)))
        .map((section) => [section.id, section])
    );
};

export default getHighlightLocationFilters;
