import { ArchiveBook, Book } from '../../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  flattenArchiveTree,
} from '../../utils/archiveTreeUtils';

const getHighlightLocationsFromBook = (book: Book | ArchiveBook) => {
  return new Map(flattenArchiveTree(book.tree).filter((section) =>
    (section.parent && archiveTreeSectionIsBook(section.parent))
    || archiveTreeSectionIsChapter(section)).map((s) => [s.id, s]));
};

export default getHighlightLocationsFromBook;
