import { ArchiveTree, ArchiveTreeSection } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  findArchiveTreeNode,
  findDefaultBookPage,
} from './archiveTreeUtils';

const makeArchiveSection = (title: string): ArchiveTreeSection => ({
  id: `${title}-id`,
  shortId: `${title}-shortid`,
  title,
});
const makeArchiveTree = (title: string, contents: ArchiveTree['contents']): ArchiveTree => ({
  ...makeArchiveSection(title),
  contents,
});

describe('findDefaultBookPage', () => {
  it('returns first page if there are no chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const book: {tree: ArchiveTree} = {tree: makeArchiveTree('book', [
      firstPage,
      makeArchiveSection('page2'),
    ])};

    expect(findDefaultBookPage(book)).toBe(firstPage);
  });

  it('returns first page of the first chapter if there are chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const book: {tree: ArchiveTree} = {tree: makeArchiveTree('book', [
      makeArchiveTree('chapter1', [
        firstPage,
        makeArchiveSection('page2'),
      ]),
      makeArchiveSection('page3'),
    ])};

    expect(findDefaultBookPage(book)).toBe(firstPage);
  });

  it('returns first page of the first nested chapter if there are nested chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const book: {tree: ArchiveTree} = {tree: makeArchiveTree('book', [
      makeArchiveTree('chapter1', [
        makeArchiveTree('chapter1.1', [
          firstPage,
          makeArchiveSection('page2'),
        ]),
        makeArchiveSection('page3'),
      ]),
      makeArchiveSection('page4'),
    ])};

    expect(findDefaultBookPage(book)).toBe(firstPage);
  });
});

describe('tree section identifiers', () => {
  const treeWithoutUnits: ArchiveTree = {
    contents: [
      {
        id: 'preface@1',
        shortId: 'prefaceshortid@1',
        title: '<span class="os-divider"> </span><span class="os-text">preface</span>',
      },
      {
        contents: [
          {
            id: 'page1@1',
            shortId: 'page1shortid@1',
            // tslint:disable-next-line:max-line-length
            title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
          },
          {
            id: 'page2@1',
            shortId: 'page2shortid@1',
            // tslint:disable-next-line:max-line-length
            title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
          },
        ],
        id: 'chapter1@1',
        shortId: 'chapter1shortid@1',
        // tslint:disable-next-line:max-line-length
        title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
      },
    ],
    id: 'bookid@1',
    shortId: 'bookshortid@1',
    title: '<span class="os-text">cool book</span>',
  };

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
});
