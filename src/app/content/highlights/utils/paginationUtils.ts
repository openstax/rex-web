import add from 'lodash/fp/add';
import flow from 'lodash/fp/flow';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import pick from 'lodash/fp/pick';
import pickBy from 'lodash/fp/pickBy';
import reduce from 'lodash/fp/reduce';
import values from 'lodash/fp/values';
import { not, reduceUntil } from '../../../fpUtils';
import { isDefined } from '../../../guards';
import { LocationFilters } from '../../components/popUp/types';
import { maxResourcesPerFetch } from '../../constants';
import { isArchiveTree } from '../../guards';
import { ArchiveTree, LinkedArchiveTreeSection } from '../../types';
import {
  archiveTreeContainsNode,
  findTreePages,
} from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import {
  CountsPerSource,
  SummaryFilters,
  SummaryHighlightsPagination,
} from '../types';

export const extractTotalCounts = (countsPerSource: CountsPerSource) =>
  mapValues(pickBy<CountsPerSource>(isDefined), countsPerSource);

const totalOfCountsForSource: (counts: CountsPerSource[string]) => number = flow(
  values,
  reduce(add, 0)
);
const totalOfCountsPerSource: (counts: CountsPerSource) => number = flow(
  values,
  map(totalOfCountsForSource),
  reduce(add, 0)
);

/*
 * in order to avoid passing all page ids for all selected chapters in
 * api requests to get highlights, we calculate how many ids are necessary
 * to fill a response based on the given CountsPerSource
 */
export const getNextPageSources = (
  remainingCounts: CountsPerSource,
  tree: ArchiveTree,
  nextPageSize?: number
): string[] => {
  // remainingCounts is not ordered, so starting with this to make sure we load pages sequentially
  const pages = findTreePages(tree);

  const reduceUntilPageSize = reduceUntil(
    (counts: CountsPerSource) => {
      const reachedResourceLimit = Object.keys(counts).length >= maxResourcesPerFetch;

      if (reachedResourceLimit) {
        return true;
      }

      if (nextPageSize && totalOfCountsPerSource(counts) >= nextPageSize) {
        return true;
      }

      return false;
    }
  );

  const addPageCount = (counts: CountsPerSource, page: LinkedArchiveTreeSection) => {
    const pageId = stripIdVersion(page.id);
    const pageCount = remainingCounts[pageId];

    if (!totalOfCountsForSource(pageCount)) {
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
  locationFilters: LocationFilters,
  counts: CountsPerSource
): CountsPerSource => {
  const chapterFilters = Array.from(locationFilters.values()).map((location) => location.section).filter(isArchiveTree);

  const someChapterContainsNode = (sourceId: string) => chapterFilters.find(
    (location) => archiveTreeContainsNode(location, sourceId)
  );

  const matchesLocationFilter = (_counts: CountsPerSource[string], sourceId: string) => {
    return locationFilters.has(sourceId) || someChapterContainsNode(sourceId);
  };

  return pickBy(matchesLocationFilter, counts);
};

export const filterCountsPerSourceByColorFilter = (
  colorFilters: SummaryFilters['colors'],
  counts: CountsPerSource
) => flow(
  mapValues(pick(colorFilters)),
  pickBy(not(isEmpty))
)(counts) as CountsPerSource;

export const incrementPage = (pagination: NonNullable<SummaryHighlightsPagination>) =>
  ({...pagination, page: pagination.page + 1});
