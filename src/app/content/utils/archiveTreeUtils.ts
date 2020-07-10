import flatten from 'lodash/fp/flatten';
import { isArchiveTree, isLinkedArchiveTree, isLinkedArchiveTreeSection } from '../guards';
import {
  ArchiveTree,
  ArchiveTreeNode,
  ArchiveTreeSection,
  LinkedArchiveTree,
  LinkedArchiveTreeNode,
  LinkedArchiveTreeSection,
  Params,
} from '../types';
import { getIdVersion, stripIdVersion } from './idUtils';

const CACHED_FLATTENED_TREES = new WeakMap<LinkedArchiveTree, Array<LinkedArchiveTree | LinkedArchiveTreeSection>>();
export function flattenArchiveTree(tree: LinkedArchiveTree): Array<LinkedArchiveTree | LinkedArchiveTreeSection> {
  if (CACHED_FLATTENED_TREES.has(tree)) {
    return CACHED_FLATTENED_TREES.get(tree)!;
  }
  const flattened = [tree, ...flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section)
      ? flattenArchiveTree({...section, parent: tree})
      : [{...section, parent: tree}])
  ))].map((section) => ({
    ...section,
    id: stripIdVersion(section.id),
    shortId: stripIdVersion(section.shortId),
    version: getIdVersion(section.id),
    ...(isLinkedArchiveTree(section) ? {
      contents: section.contents,
      parent: section.parent,
    } : {
      parent: section.parent,
    }),
  }));
  CACHED_FLATTENED_TREES.set(tree, flattened);
  return flattened;
}

export const linkArchiveTree = (tree: ArchiveTree): LinkedArchiveTree =>
  flattenArchiveTree(tree)[0] as LinkedArchiveTree;

export const findTreePages = (tree: LinkedArchiveTree): LinkedArchiveTreeSection[] =>
  flattenArchiveTree(tree).filter(archiveTreeSectionIsPage);

export const findDefaultBookPage = (book: {tree: ArchiveTree}) => {
  const resolvePage = (target: ArchiveTree | ArchiveTreeSection): ArchiveTreeSection =>
    isArchiveTree(target) ? resolvePage(target.contents[0]) : target;

  const firstSubtree = book.tree.contents.find(isArchiveTree);

  if (firstSubtree) {
    return resolvePage(firstSubtree);
  } else {
    return book.tree.contents[0];
  }
};

export const nodeMatcher = (nodeId: string) => (node: ArchiveTreeNode) =>
  stripIdVersion(node.shortId) === stripIdVersion(nodeId)
  || stripIdVersion(node.id) === stripIdVersion(nodeId);

export const nodeHasId = (nodeId: string, node: ArchiveTreeNode) => nodeMatcher(nodeId)(node);

export const splitTitleParts = (str: string) => {

  const domNode = new DOMParser().parseFromString(str, 'text/html');
  const titleNode = domNode.querySelector('.os-text');
  const numNode = domNode.querySelector('.os-number');

  const title = titleNode ? titleNode.textContent : str;
  const num = numNode ? numNode.textContent : null;

  return [num, title];
};

export const getArchiveTreeSectionNumber = (section: ArchiveTreeSection) => splitTitleParts(section.title)[0];
export const getArchiveTreeSectionTitle = (section: ArchiveTreeSection) => splitTitleParts(section.title)[1];

export const findArchiveTreeNode = (
  tree: ArchiveTree,
  nodeId: string
): LinkedArchiveTree | LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(tree).find(nodeMatcher(nodeId));

export const findArchiveTreeNodeByPageParam = (
  tree: ArchiveTree,
  pageParam: Params['page']
): LinkedArchiveTree | LinkedArchiveTreeSection | undefined => {
  return findTreePages(tree).find((node) =>
    'uuid' in pageParam
      ? node.id === pageParam.uuid
      : node.slug.toLowerCase() === pageParam.slug.toLowerCase()
  );
};

export const archiveTreeContainsNode = (
  tree: ArchiveTree,
  nodeId: string
): boolean => !!findArchiveTreeNode(tree, nodeId);

interface Sections {
  prev?: LinkedArchiveTreeSection | undefined;
  next?: LinkedArchiveTreeSection | undefined;
}

export const prevNextBookPage = (
  book: {tree: ArchiveTree},
  pageId: string
): Sections => {
  const flattenTree = findTreePages(book.tree);
  const index = flattenTree.findIndex(nodeMatcher(pageId));

  return {
    next: flattenTree[index + 1],
    prev: flattenTree[index - 1],
  };
};

export const archiveTreeSectionIsBook = (section: LinkedArchiveTreeNode | undefined) => section && !section.parent;
export const archiveTreeSectionIsPage = isLinkedArchiveTreeSection;
export const archiveTreeSectionIsUnit = (section: LinkedArchiveTreeNode) =>
  isArchiveTree(section)
  && !!section.parent
  && archiveTreeSectionIsBook(section.parent)
  && getArchiveTreeSectionNumber(section) === null
;
export const archiveTreeSectionIsChapter = (section: LinkedArchiveTreeNode): section is LinkedArchiveTree =>
  isLinkedArchiveTree(section)
  && !archiveTreeSectionIsBook(section)
  && getArchiveTreeSectionNumber(section) !== null
;
