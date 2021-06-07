import curry from 'lodash/fp/curry';
import flatten from 'lodash/fp/flatten';
import { assertDefined } from '../../utils';
import { isArchiveTree, isLinkedArchiveTree, isLinkedArchiveTreeSection } from '../guards';
import {
  ArchiveTree,
  ArchiveTreeNode,
  ArchiveTreeSection,
  Book,
  LinkedArchiveTree,
  LinkedArchiveTreeNode,
  LinkedArchiveTreeSection,
  Params,
} from '../types';
import { getIdVersion, stripIdVersion } from './idUtils';

const domParser = new DOMParser();

export const CACHED_FLATTENED_TREES = new Map<string, Array<LinkedArchiveTree | LinkedArchiveTreeSection>>();
let cacheArchiveTrees = true;
export const disableArchiveTreeCaching = () => cacheArchiveTrees = false;

export function flattenArchiveTree(tree: LinkedArchiveTree): Array<LinkedArchiveTree | LinkedArchiveTreeSection> {
  // Cache is disabled for testing
  /* istanbul ignore next */
  if (CACHED_FLATTENED_TREES.has(tree.id)) {
    return assertDefined(CACHED_FLATTENED_TREES.get(tree.id), `we've already checkf for .has(tree.id)`);
  }
  const flattened = [tree, ...flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section)
      ? flattenArchiveTree({...section, parent: tree})
      : [{...section, parent: tree}])
  ))].map((section) => ({
    ...section,
    id: stripIdVersion(section.id),
    version: getIdVersion(section.id),
    ...(isLinkedArchiveTree(section) ? {
      contents: section.contents,
      parent: section.parent,
    } : {
      parent: section.parent,
    }),
  }));
  // Cache is disabled for testing
  /* istanbul ignore next */
  if (cacheArchiveTrees) {
    CACHED_FLATTENED_TREES.set(tree.id, flattened);
  }
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
  stripIdVersion(node.id) === stripIdVersion(nodeId);

export const nodeHasId = (nodeId: string, node: ArchiveTreeNode) => nodeMatcher(nodeId)(node);

export const splitTitleParts = (str: string) => {
  const domNode = domParser.parseFromString(str, 'text/html');
  const titleNode = domNode.querySelector('.os-text');
  const numNode = domNode.querySelector('.os-number');

  const title = titleNode ? titleNode.textContent : str;
  const num = numNode ? numNode.textContent : null;

  return [num, title];
};

export const getArchiveTreeSectionNumber = (section: ArchiveTreeSection) => splitTitleParts(section.title)[0];
export const getArchiveTreeSectionTitle = (section: ArchiveTreeSection) => splitTitleParts(section.title)[1];

export const findArchiveTreeNode = curry((
  matcher: (node: LinkedArchiveTreeNode | LinkedArchiveTreeSection) => boolean,
  tree: ArchiveTree
): LinkedArchiveTree | LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(tree).find(matcher)
);

export const findArchiveTreeNodeById = (
  tree: ArchiveTree,
  nodeId: string
): LinkedArchiveTree | LinkedArchiveTreeSection | undefined =>
  findArchiveTreeNode(nodeMatcher(nodeId), tree);

export const findArchiveTreeNodeByPageParam = (
  tree: ArchiveTree,
  pageParam: Params['page']
): LinkedArchiveTree | LinkedArchiveTreeSection | undefined => findArchiveTreeNode(
  (node) => archiveTreeSectionIsPage(node) &&
    ('uuid' in pageParam
      ? node.id === pageParam.uuid
      : node.slug.toLowerCase() === pageParam.slug.toLowerCase()),
  tree
);

export const archiveTreeContainsNode = (
  tree: ArchiveTree,
  nodeId: string
): boolean => !!findArchiveTreeNodeById(tree, nodeId);

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

export const getTitleFromArchiveNode = (book: Book, node: ArchiveTree | ArchiveTreeSection): string => {
  const domNode = domParser.parseFromString(`<div id="container">${node.title}</div>`, 'text/html');
  const container = domNode.getElementById('container');

  const extra = container.querySelector<HTMLSpanElement>('.os-part-text');
  const divider = container.querySelector<HTMLSpanElement>('.os-divider');
  const number = container.querySelector<HTMLSpanElement>('.os-number');
  const section = findArchiveTreeNodeById(book.tree, node.id);

  if (section && archiveTreeSectionIsUnit(section)) {
    if (number) { number.remove(); }
    if (divider) { divider.remove(); }
  } else if (section && archiveTreeSectionIsPage(section) && extra && /appendix/i.test(extra.innerHTML)) {
    divider.innerHTML = ' | ';
  }

  if (extra) { extra.remove(); }

  return container.innerHTML;
};

export const archiveTreeSectionIsBook = (
  section: LinkedArchiveTreeNode | undefined) => Boolean(section && !section.parent);
export const archiveTreeSectionIsPage = isLinkedArchiveTreeSection;
export const archiveTreeSectionIsUnit = (section: LinkedArchiveTreeNode) =>
  isArchiveTree(section)
  && archiveTreeSectionIsBook(section.parent)
  && section.contents.every(isArchiveTree)
;
export const archiveTreeSectionIsChapter = (section: LinkedArchiveTreeNode): section is LinkedArchiveTree =>
  isLinkedArchiveTree(section)
  && !archiveTreeSectionIsBook(section)
  && getArchiveTreeSectionNumber(section) !== null
  && section.contents.some((node) => !isArchiveTree(node))
;
