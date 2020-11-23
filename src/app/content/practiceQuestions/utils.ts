import { LocationFiltersWithChildren } from '../components/popUp/types';
import { isLinkedArchiveTreeSection } from '../guards';
import { Book, LinkedArchiveTreeSection } from '../types';
import { findArchiveTreeNodeById, flattenArchiveTree } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import { PracticeQuestionsSummary } from './types';

export const pageHasPracticeQuestions = (pageId: string, summary: PracticeQuestionsSummary) => {
  return Boolean(summary.countsPerSource[pageId]);
};

export const getPracticeQuestionsLocationFilters = (
  summary: PracticeQuestionsSummary | null, book: Book | undefined
) => {
  // key is an id of a parent of sections stored in a value
  const locationFilters: LocationFiltersWithChildren = new Map();

  if (!book || !summary) { return locationFilters; }

  const tree = flattenArchiveTree(book.tree);

  for (const node of tree) {
    if (isLinkedArchiveTreeSection(node) && summary.countsPerSource[stripIdVersion(node.id)]) {
      const parentId = stripIdVersion(node.parent.id);
      const parentFilters = locationFilters.get(parentId);
      const currentSections = parentFilters && parentFilters.children ? parentFilters.children : [];
      locationFilters.set(parentId, { section: node.parent, children: [...currentSections, node] });
    }
  }

  return locationFilters;
};

const flattenLocationFilters = (locationFilters: LocationFiltersWithChildren) => {
  let flattened: LinkedArchiveTreeSection[] = [];
  for (const { children } of locationFilters.values()) {
    flattened = flattened.concat(children);
  }
  return flattened;
};

export const getNextPageWithPracticeQuestions = (
  nodeId: string, locationFilters: LocationFiltersWithChildren, book: Book | undefined
) => {
  if (!book) { return; }

  const node = findArchiveTreeNodeById(book.tree, nodeId);

  if (!node) { return; }

  const flatLocationFilters = flattenLocationFilters(locationFilters);
  const flatTree = flattenArchiveTree(book.tree);
  const nodeIndex = flatTree.findIndex((search) => search.id === node.id);
  const remainingNodes = flatTree.slice(nodeIndex + 1).map((section) => stripIdVersion(section.id));

  return flatLocationFilters.find((filter) => remainingNodes.includes(filter.id));
};
