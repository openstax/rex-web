import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import { highlightStyles } from '../../constants';
import {
  ArchiveBook,
  Book,
  LinkedArchiveTree,
  LinkedArchiveTreeNode,
  LinkedArchiveTreeSection,
  Page
} from '../../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  findArchiveTreeNode,
  flattenArchiveTree,
} from '../../utils/archiveTreeUtils';
import { CountsPerSource, HighlightLocationFilters } from '../types';

type LocationFilterSection = LinkedArchiveTree | LinkedArchiveTreeSection;

const getLocationFilterSectionsForBook = (book: Book | ArchiveBook | undefined) => book
  ? flattenArchiveTree(book.tree)
  : [];

const sectionsToLocationFilters = (sections: LocationFilterSection[]): HighlightLocationFilters =>
  new Map(sections.map((section) => [section.id, section]));

export const getHighlightLocationFilters = (filterBy: (section: LocationFilterSection) => boolean) => flow(
  getLocationFilterSectionsForBook,
  (sections) => sections.filter(filterBy),
  sectionsToLocationFilters
);

export const sectionIsHighlightLocationFitler = (section: LocationFilterSection) =>
  (archiveTreeSectionIsPage(section) && archiveTreeSectionIsBook(section.parent))
  || (archiveTreeSectionIsChapter(section) && !archiveTreeSectionIsUnit(section));

export const getHighlightLocationFilterForPage = (
  locationFilters: HighlightLocationFilters, page: Page | LinkedArchiveTreeNode | string
) => {
  const pageId = typeof page === 'string' ? page : page.id;
  let location = locationFilters.get(pageId);

  if (!location) {
    for (const section of locationFilters.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, pageId)) {
        location = section;
        break;
      }
    }
  }

  return location;
};

export const getHighlightLocationFiltersWithContent = (
  locationFilters: HighlightLocationFilters, totalCounts: CountsPerSource
) => {

  return Object.entries(totalCounts).reduce((result, [pageId]) => {
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);

    if (location && !result.has(location.id)) {
      result.add(location.id);
    }

    return result;
  }, new Set<string>());
};

export const getHighlightColorFiltersWithContent = (locationsWithContent: CountsPerSource) => {
  const colorFiltersWithContent: Set<HighlightColorEnum> = new Set();

  for (const colorCounts of Object.values(locationsWithContent)) {
    for (const color of Object.keys(colorCounts)) {
      colorFiltersWithContent.add(color as HighlightColorEnum);
    }
    // If already all colors were found, break without processing rest of object
    if (colorFiltersWithContent.size === highlightStyles.length) { break; }
  }

  return colorFiltersWithContent;
};
