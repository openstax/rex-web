import add from 'lodash/fp/add';
import { reduceUntil } from '../../../fpUtils';
import { ArchiveTree, LinkedArchiveTreeSection } from '../../types';
import { findTreePages } from '../../utils/archiveTreeUtils';
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
