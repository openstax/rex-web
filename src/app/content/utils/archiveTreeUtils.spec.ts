import { book } from '../../../test/mocks/archiveLoader';
import makeArchiveSection from '../../../test/mocks/archiveSection';
import makeArchiveTree from '../../../test/mocks/archiveTree';
import { treeWithoutUnits, treeWithUnits } from '../../../test/trees';
import { ArchiveTree, LinkedArchiveTree } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  findArchiveTreeNodeById,
  findArchiveTreeNodeByPageParam,
  findDefaultBookPage,
  getArchiveTreeSectionNumber,
  getArchiveTreeSectionTitle,
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

describe('findArchiveTreeNodeByPageParam', () => {
  it('finds node by id', () => {
    expect(findArchiveTreeNodeByPageParam(treeWithUnits, {uuid: 'page1' })).toBeDefined();
  });
  it('matches only page nodes', () => {
    const unit = treeWithUnits.contents[1] as LinkedArchiveTree;
    const chapter = unit.contents[0];
    const pageToFind = findArchiveTreeNodeById(treeWithUnits, 'page1');

    if (!pageToFind) {
      return expect(pageToFind).toBeTruthy();
    }

    unit.slug = pageToFind.slug;
    chapter.slug = pageToFind.slug;

    const foundNode = findArchiveTreeNodeByPageParam(treeWithUnits, {slug: pageToFind.slug});

    if (!foundNode) {
      return expect(foundNode).toBeTruthy();
    }

    expect(foundNode.id).toEqual(pageToFind.id);
  });
});

describe('getArchiveTreeSectionNumber', () => {
  it('returns number', () => {
    expect(
      getArchiveTreeSectionNumber(makeArchiveSection(
        '<span class="os-number">4</span><span class="os-text">foobar</span>'
      ))
    ).toEqual('4');
  });
  it('returns null when book is not baked', () => {
    expect(getArchiveTreeSectionNumber(makeArchiveSection('unbaked-title'))).toEqual(null);
  });
});

describe('getArchiveTreeSectionTitle', () => {
  it('returns title', () => {
    expect(
      getArchiveTreeSectionTitle(makeArchiveSection(
        '<span class="os-number">4</span><span class="os-text">foobar</span>'
      ))
    ).toEqual('foobar');
  });
  it('returns title when book is not baked', () => {
    expect(getArchiveTreeSectionTitle(makeArchiveSection('unbaked-title'))).toEqual('unbaked-title');
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
    const preface = findArchiveTreeNodeById(treeWithoutUnits, 'preface');

    if (!preface) {
      return expect(preface).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(preface)).toBe(false);
    expect(archiveTreeSectionIsPage(preface)).toBe(true);
    expect(archiveTreeSectionIsUnit(preface)).toBe(false);
    expect(archiveTreeSectionIsChapter(preface)).toBe(false);
  });

  it('identifies chapters', () => {
    const chapter = findArchiveTreeNodeById(treeWithoutUnits, 'chapter1');

    if (!chapter) {
      return expect(chapter).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(chapter)).toBe(false);
    expect(archiveTreeSectionIsPage(chapter)).toBe(false);
    expect(archiveTreeSectionIsUnit(chapter)).toBe(false);
    expect(archiveTreeSectionIsChapter(chapter)).toBe(true);
  });

  it('identifies units', () => {
    const unit = findArchiveTreeNodeById(treeWithUnits, 'unitid');

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
