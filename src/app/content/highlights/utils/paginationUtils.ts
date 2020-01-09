import add from 'lodash/fp/add';
import omit from 'lodash/fp/omit';
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

export const filterCountsToUnvisitiedPages = (
  loadedCounts: CountsPerSource,
  totalCounts: CountsPerSource
): CountsPerSource => {
  return omit(Object.keys(loadedCounts), totalCounts);
};

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
  // remainingCounts is not ordered, so starting with this to make sure
  // we load pages sequentially
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

/*
 * CountsPerSource returned by api does not filter by source id, only color,
 * so in order for our filteredTotalCounts to reflect reality we need to filter
 * its page ids by the filter chapters
 */
export const filterCountsPerSourceByChapters = (
  chapterFilters: HighlightLocationFilters,
  counts: CountsPerSource
) => {
  const someChapterContainsNode = (sourceId: string) => !!Array.from(chapterFilters.values()).find(
    (location) => isArchiveTree(location) && archiveTreeContainsNode(location, sourceId)
  );

  const matchesChapterFilter = (_count: number, sourceId: string) => {
    // chapterFilters isn't actually just chapters, it also contains pages
    // that have no chapter
    return chapterFilters.has(sourceId)
      || someChapterContainsNode(sourceId);
  };

  return pickBy(matchesChapterFilter, counts);
};
