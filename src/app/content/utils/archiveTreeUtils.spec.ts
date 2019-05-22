import { ArchiveTree, ArchiveTreeSection } from '../types';
import { findDefaultBookPage } from './archiveTreeUtils';

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
