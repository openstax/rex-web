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

export const findArchiveTreeSection = (
  book: {tree: ArchiveTree},
  pageId: string
): LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(book.tree).find((section) =>
    stripIdVersion(section.shortId) === stripIdVersion(pageId)
    || stripIdVersion(section.id) === stripIdVersion(pageId)
  );

export const prevNextBookPage = (
  book: {tree: ArchiveTree},
  pageId: string
): {} | undefined => {
  const flattenTree = flattenArchiveTree(book.tree);
  const currentSection = findArchiveTreeSection(book, pageId);

  const sections: { [s: string]: object; } = {};

  if ( flattenTree && currentSection ) {
    const index = flattenTree.findIndex((currentSection) =>
    stripIdVersion(currentSection.shortId) === stripIdVersion(pageId)
    || stripIdVersion(currentSection.id) === stripIdVersion(pageId));

    if ( index > 0 && index < (flattenTree.length - 1)) {
      sections.prev = flattenTree[index - 1];
      sections.next = flattenTree[index + 1];

    } else if ( index > 0 && index === (flattenTree.length - 1)) {
      sections.prev = flattenTree[index - 1];

    } else if (index === 0) {
      sections.next = flattenTree[index + 1];

    } else {
      sections.prev = {};
      sections.next = {};
    }
  }

  return sections;
};
