import { ArchiveBook, Book } from '../../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  flattenArchiveTree,
} from '../../utils/archiveTreeUtils';

const getHighlightLocationFilters = (book: Book | ArchiveBook) => {
  return new Map(
    flattenArchiveTree(book.tree)
      .filter((section) =>
        (archiveTreeSectionIsPage(section) && archiveTreeSectionIsBook(section.parent))
        || (archiveTreeSectionIsChapter(section) && !archiveTreeSectionIsUnit(section)))
      .map((section) => [section.id, section])
  );
};

export default getHighlightLocationFilters;
