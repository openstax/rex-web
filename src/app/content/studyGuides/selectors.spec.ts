import { treeWithoutUnits } from '../../../test/trees';
import { book } from '../selectors';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import * as select from './selectors';

const mockBook = book as any as jest.SpyInstance;

jest.mock('../selectors', () => ({
  book: jest.fn(),
  localState: (state: any) => ({studyGuides: state}),
  page: jest.fn(),
}));

describe('studyGuidesLocationFiltersWithContent', () => {
  it('filters', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    const section = findArchiveTreeNodeById(treeWithoutUnits, 'chapter1')!;
    expect(select.studyGuidesLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: {page1: { blue: 1 }, page2: { pink: 3 }, preface: { yellow: 2 }},
      },
    } as any)).toEqual(new Map([['chapter1', section]]));
  });

  it('works with null counts', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.studyGuidesLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: null,
      },
    } as any)).toEqual(new Map());
  });
});
