import { book } from '../../../test/mocks/archiveLoader';
import makeArchiveSection from '../../../test/mocks/archiveSection';
import makeArchiveTree from '../../../test/mocks/archiveTree';
import { treeWithoutUnits, treeWithUnits } from '../../../test/trees';
import { ArchiveTree } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  findArchiveTreeNode,
  findDefaultBookPage,
  nodeHasId,
  splitTitleParts,
} from './archiveTreeUtils';

describe('findDefaultBookPage', () => {
  it('returns first page if there are no chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const testBook: { tree: ArchiveTree } = {
      tree: makeArchiveTree('book', [firstPage, makeArchiveSection('page2')]),
    };

    expect(findDefaultBookPage(testBook)).toBe(firstPage);
  });

  it('returns first page of the first chapter if there are chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const testBook: { tree: ArchiveTree } = {
      tree: makeArchiveTree('book', [
        makeArchiveTree('chapter1', [firstPage, makeArchiveSection('page2')]),
        makeArchiveSection('page3'),
      ]),
    };

    expect(findDefaultBookPage(testBook)).toBe(firstPage);
  });

  it('returns first page of the first nested chapter if there are nested chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const testBook: { tree: ArchiveTree } = {
      tree: makeArchiveTree('book', [
        makeArchiveTree('chapter1', [
          makeArchiveTree('chapter1.1', [
            firstPage,
            makeArchiveSection('page2'),
          ]),
          makeArchiveSection('page3'),
        ]),
        makeArchiveSection('page4'),
      ]),
    };

    expect(findDefaultBookPage(testBook)).toBe(firstPage);
  });
});

describe('splitTitleParts', () => {
  it('returns null when book is not baked', () => {
    expect(splitTitleParts('unbaked-title')).toEqual([null, 'unbaked-title']);
  });
});

describe('tree section identifiers', () => {
  it('identifies the book', () => {
    expect(archiveTreeSectionIsBook(treeWithoutUnits)).toBe(true);
    expect(archiveTreeSectionIsPage(treeWithoutUnits)).toBe(false);
    expect(archiveTreeSectionIsUnit(treeWithoutUnits)).toBe(false);
    expect(archiveTreeSectionIsChapter(treeWithoutUnits)).toBe(false);
  });

  it('identifies the preface', () => {
    const preface = findArchiveTreeNode(treeWithoutUnits, 'preface');

    if (!preface) {
      return expect(preface).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(preface)).toBe(false);
    expect(archiveTreeSectionIsPage(preface)).toBe(true);
    expect(archiveTreeSectionIsUnit(preface)).toBe(false);
    expect(archiveTreeSectionIsChapter(preface)).toBe(false);
  });

  it('identifies chapters', () => {
    const chapter = findArchiveTreeNode(treeWithoutUnits, 'chapter1');

    if (!chapter) {
      return expect(chapter).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(chapter)).toBe(false);
    expect(archiveTreeSectionIsPage(chapter)).toBe(false);
    expect(archiveTreeSectionIsUnit(chapter)).toBe(false);
    expect(archiveTreeSectionIsChapter(chapter)).toBe(true);
  });

  it('identifies units', () => {
    const unit = findArchiveTreeNode(treeWithUnits, 'unitid');

    if (!unit) {
      return expect(unit).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(unit)).toBe(false);
    expect(archiveTreeSectionIsPage(unit)).toBe(false);
    expect(archiveTreeSectionIsUnit(unit)).toBe(true);
    expect(archiveTreeSectionIsChapter(unit)).toBe(false);
  });
});

describe('nodeHasId', () => {
  const node = book.tree.contents[0];
  it('return true if node has id', () => {
    expect(nodeHasId(node.id, node)).toEqual(true);
  });

  it('return false if node does not have id', () => {
    expect(nodeHasId('some-id', node)).toEqual(false);
  });
});
