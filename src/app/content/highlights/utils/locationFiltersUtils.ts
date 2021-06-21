import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import { LocationFilters } from '../../components/popUp/types';
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
  archiveTreeSectionIsAnswerKey,
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  findArchiveTreeNodeById,
  flattenArchiveTree,
} from '../../utils/archiveTreeUtils';
import { CountsPerSource } from '../types';

type LocationFilterSection = LinkedArchiveTree | LinkedArchiveTreeSection;

const getLocationFilterSectionsForBook = (book: Book | ArchiveBook | undefined) => book
  ? flattenArchiveTree(book.tree)
  : [];

const sectionsToLocationFilters = (sections: LocationFilterSection[]): LocationFilters =>
  new Map(sections.map((section) => [section.id, { section }]));

export const getHighlightLocationFilters = (filterBy: (section: LocationFilterSection) => boolean) => flow(
  getLocationFilterSectionsForBook,
  (sections) => sections.filter(filterBy),
  sectionsToLocationFilters
);

export const sectionIsHighlightLocationFitler = (section: LocationFilterSection) =>
  (archiveTreeSectionIsPage(section) && archiveTreeSectionIsBook(section.parent))
  || (archiveTreeSectionIsChapter(section) && !archiveTreeSectionIsUnit(section))
  || archiveTreeSectionIsAnswerKey(section)
;

export const getHighlightLocationFilterForPage = (
  locationFilters: LocationFilters, page: Page | LinkedArchiveTreeNode | string
) => {
  const pageId = typeof page === 'string' ? page : page.id;
  let location = locationFilters.get(pageId);

  if (!location) {
    for (const filter of locationFilters.values()) {
      if (
        (archiveTreeSectionIsChapter(filter.section) || archiveTreeSectionIsAnswerKey(filter.section))
        && findArchiveTreeNodeById(filter.section, pageId)
      ) {
        location = filter;
        break;
      }
    }
  }

  return location ? location.section : undefined;
};

export const getHighlightLocationFiltersWithContent = (
  locationFilters: LocationFilters, totalCounts: CountsPerSource
) => {

  return Object.entries(totalCounts).reduce((result, [pageId]) => {
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);

    if (location && !result.has(location.id)) {
      result.set(location.id, location);
    }

    return result;
  }, new Map<string, LinkedArchiveTreeNode>());
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
