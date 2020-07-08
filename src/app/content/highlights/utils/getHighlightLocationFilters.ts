import flow from 'lodash/fp/flow';
import { ArchiveBook, Book, LinkedArchiveTree, LinkedArchiveTreeSection } from '../../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  flattenArchiveTree,
} from '../../utils/archiveTreeUtils';
import { HighlightLocationFilters } from '../types';

type LocationFilterSection = LinkedArchiveTree | LinkedArchiveTreeSection;

const sectionIsLocationFilter = (section: LocationFilterSection) =>
  (archiveTreeSectionIsPage(section) && archiveTreeSectionIsBook(section.parent))
  || (archiveTreeSectionIsChapter(section) && !archiveTreeSectionIsUnit(section));

const getLocationFilterSectionsForBook = (book: Book | ArchiveBook | undefined) => book
  ? flattenArchiveTree(book.tree).filter(sectionIsLocationFilter)
  : [];

const sectionsToLocationFilters = (sections: LocationFilterSection[]): HighlightLocationFilters =>
  new Map(sections.map((section) => [section.id, section]));

export const getHighlightLocationFilters = flow(
  getLocationFilterSectionsForBook,
  sectionsToLocationFilters
);

export const getFilteredHighlightLocationFilters = (filterBy: (section: LocationFilterSection) => boolean) => flow(
  getLocationFilterSectionsForBook,
  (sections) => sections.filter(filterBy),
  sectionsToLocationFilters
);
