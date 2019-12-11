import add from 'lodash/fp/add';
import pickBy from 'lodash/fp/pickBy';
import { reduceUntil } from '../../../fpUtils';
import { isDefined } from '../../../guards';
import { ArchiveTree, LinkedArchiveTreeSection } from '../../types';
import {
  archiveTreeContainsNode,
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  findTreePages
} from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { CountsPerSource } from '../types';

const totalOfCountsPerSource = (perSource: CountsPerSource) => Object.values(perSource).reduce(add, 0);

const diffSourceCounts = (base: CountsPerSource, diff: CountsPerSource) => Object.keys(base).reduce(
  (counts: CountsPerSource, key: string) => ({...counts, [key]: base[key] - (diff[key] || 0)}),
  {} as CountsPerSource
);

export const getRemainingSourceCounts = (
  loadedCounts: CountsPerSource,
  totalCounts: CountsPerSource
): CountsPerSource => {
  return diffSourceCounts(totalCounts, loadedCounts);
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
  chapterFilters: string[],
  tree: ArchiveTree,
  counts: CountsPerSource
) => {
  const chapterFilterNodes = chapterFilters
    .map((id) => findArchiveTreeNode(tree, id))
    .filter(isDefined)
    .filter(archiveTreeSectionIsChapter)
  ;

  const someChapterContainsNode = (sourceId: string) =>
    !!chapterFilterNodes.find((chapterNode) => archiveTreeContainsNode(chapterNode, sourceId));

  const matchesChapterFilter = (_count: number, sourceId: string) => {
    // chapterFilters isn't actually just chapters, it also contains pages
    // that have no chapter
    return chapterFilters.includes(sourceId)
      || someChapterContainsNode(sourceId);
  };

  return pickBy(matchesChapterFilter, counts);
};
