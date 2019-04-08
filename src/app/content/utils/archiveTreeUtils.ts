import flatten from 'lodash/fp/flatten';
import { isArchiveTree } from '../guards';
import { ArchiveTree, ArchiveTreeSection, LinkedArchiveTreeSection } from '../types';
import { getIdVersion, stripIdVersion } from './idUtils';

export function flattenArchiveTree(tree: ArchiveTree): LinkedArchiveTreeSection[] {
  return flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section) ? flattenArchiveTree(section) : [{...section, parent: tree}]))
  ).map((section) => ({
    id: stripIdVersion(section.id),
    parent: section.parent,
    shortId: stripIdVersion(section.shortId),
    title: section.title,
    version: getIdVersion(section.id),
  }));
}

export const findDefaultBookPage = (book: {tree: ArchiveTree}) => {
  const getFirstTreeSection = (tree: ArchiveTree) => tree.contents.find(isArchiveTree);

  const getFirstTreeSectionOrPage = (tree: ArchiveTree): ArchiveTreeSection => {
    const firstSection = getFirstTreeSection(tree);

    if (firstSection) {
      return getFirstTreeSectionOrPage(firstSection);
    } else {
      return tree.contents[0];
    }
  };

  return getFirstTreeSectionOrPage(book.tree);
};

const sectionMatcher = (id: string, shortId: string, pageId: string) =>
    stripIdVersion(shortId) === stripIdVersion(pageId)
    || stripIdVersion(id) === stripIdVersion(pageId);

export const findArchiveTreeSection = (
  book: {tree: ArchiveTree},
  pageId: string
): LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(book.tree).find((section) => sectionMatcher(section.id, section.shortId, pageId)
);

interface Sections {
  prev?: LinkedArchiveTreeSection | undefined;
  next?: LinkedArchiveTreeSection | undefined;
}

export const prevNextBookPage = (
  book: {tree: ArchiveTree},
  pageId: string
): Sections | undefined => {
  const flattenTree = flattenArchiveTree(book.tree);
  const currentSection = findArchiveTreeSection(book, pageId);

  if ( flattenTree && currentSection ) {
    const index = flattenTree.findIndex((currentSection) =>
    sectionMatcher(currentSection.id, currentSection.shortId, pageId));

    if ( index !== -1) {
      const sections: Sections = {
        next: flattenTree[index + 1],
        prev: flattenTree[index - 1],
      };

      return sections;
    }
  }
};
