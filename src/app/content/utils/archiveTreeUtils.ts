import flatten from 'lodash/fp/flatten';
import { isArchiveTree } from '../guards';
import { ArchiveTree, ArchiveTreeSection, LinkedArchiveTree, LinkedArchiveTreeSection } from '../types';
import { getIdVersion, stripIdVersion } from './idUtils';

export function flattenArchiveTree(tree: LinkedArchiveTree): LinkedArchiveTreeSection[] {
  return flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section)
      ? flattenArchiveTree({...section, parent: tree})
      : [{...section, parent: tree}])
  )).map((section) => ({
    id: stripIdVersion(section.id),
    parent: section.parent,
    shortId: stripIdVersion(section.shortId),
    title: section.title,
    version: getIdVersion(section.id),
  }));
}

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

const sectionMatcher = (pageId: string) => (section: ArchiveTreeSection) =>
  stripIdVersion(section.shortId) === stripIdVersion(pageId)
  || stripIdVersion(section.id) === stripIdVersion(pageId);

export const splitTitleParts = (str: string) => {
  const match = str
    // remove html tags from tree title
    .replace(/<[^>]+>/g, '')
    // split out section number from title
    .match(/^([0-9\.]*)?(.*)$/);

  if (match && match[2]) {
    // ignore the first match which is the whole title
    return match.slice(1);
  } else {
    return [null, null];
  }
};

export const findArchiveTreeSection = (
  tree: ArchiveTree,
  pageId: string
): LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(tree).find(sectionMatcher(pageId));

export const archiveTreeContainsSection = (
  tree: ArchiveTree,
  pageId: string
): boolean => !!findArchiveTreeSection(tree, pageId);

interface Sections {
  prev?: LinkedArchiveTreeSection | undefined;
  next?: LinkedArchiveTreeSection | undefined;
}

export const prevNextBookPage = (
  book: {tree: ArchiveTree},
  pageId: string
): Sections => {
  const flattenTree = flattenArchiveTree(book.tree);
  const index = flattenTree.findIndex(sectionMatcher(pageId));

  return {
    next: flattenTree[index + 1],
    prev: flattenTree[index - 1],
  };
};
