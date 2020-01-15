import add from 'lodash/fp/add';
import pickBy from 'lodash/fp/pickBy';
import { reduceUntil } from '../../../fpUtils';
import { isArchiveTree } from '../../guards';
import { ArchiveTree, LinkedArchiveTreeSection } from '../../types';
import {
  archiveTreeContainsNode,
  findTreePages
} from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { CountsPerSource, HighlightLocationFilters } from '../types';

const totalOfCountsPerSource = (perSource: CountsPerSource) => Object.values(perSource).reduce(add, 0);

/*
 * in order to avoid passing all page ids for all selected chapters in
 * api requests to get highlights, we calculate how many ids are necessary
 * to fill a response based on the given CountsPerSource
 */
export const getNextPageSources = (
  remainingCounts: CountsPerSource,
  tree: ArchiveTree,
  nextPageSize: number
): string[] => {
  // remainingCounts is not ordered, so starting with this to make sure we load pages sequentially
  const pages = findTreePages(tree);

  const reduceUntilPageSize = reduceUntil(
    (counts: CountsPerSource) => totalOfCountsPerSource(counts) >= nextPageSize
  );

  const addPageCount = (counts: CountsPerSource, page: LinkedArchiveTreeSection) => {
    const pageId = stripIdVersion(page.id);
    const pageCount = remainingCounts[pageId];

    if (!pageCount) {
      return counts;
    }

    return {
      ...counts,
      [pageId]: pageCount,
    };
  };

  return Object.keys(reduceUntilPageSize(pages, addPageCount, {} as CountsPerSource));
};

export const filterCountsPerSourceByLocationFilter = (
  locationFilters: HighlightLocationFilters,
  counts: CountsPerSource
) => {
  const chapterFilters = Array.from(locationFilters.values()).filter(isArchiveTree);

  const someChapterContainsNode = (sourceId: string) => chapterFilters.find(
    (location) => archiveTreeContainsNode(location, sourceId)
  );

  const matchesLocationFilter = (_count: number, sourceId: string) => {
    return locationFilters.has(sourceId) || someChapterContainsNode(sourceId);
  };

  return pickBy(matchesLocationFilter, counts);
};
