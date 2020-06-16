import { treeWithoutUnits } from '../../../test/trees';
import { book, highlightLocationFilters } from '../selectors';
import * as select from './selectors';
import { getHighlightLocationFilters } from './utils';

const mockBook = book as any as jest.SpyInstance;
const mockFilters = highlightLocationFilters as any as jest.SpyInstance;

jest.mock('../selectors', () => ({
  book: jest.fn(),
  highlightLocationFilters: jest.fn(),
  localState: (state: any) => ({highlights: state}),
}));

describe('focused', () => {
  it('gets focused highlight id', () => {
    expect(select.focused({currentPage: {focused: 'asdf'}} as any)).toEqual('asdf');
  });
});

describe('highlightLocationFiltersWithContent', () => {
  it('filters', () => {
    const testBook = {id: 'enabledbook', tree: treeWithoutUnits};

    mockBook.mockReturnValue(testBook);
    mockFilters.mockReturnValue(getHighlightLocationFilters(testBook as any));
    expect(select.highlightLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: {page1: { blue: 1 }, page2: { pink: 3 }, preface: { yellow: 2 }},
      },
    } as any)).toEqual(new Set(['chapter1', 'preface']));
  });

  it('works with null counts', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.highlightLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: null,
      },
    } as any)).toEqual(new Set());
  });
});

describe('highlightColorFiltersWithContent', () => {
  it('filters', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.highlightColorFiltersWithContent({
      summary: {
        totalCountsPerPage: {page1: { blue: 1 }, page2: { pink: 3 }, preface: { yellow: 2 }},
      },
    } as any)).toEqual(new Set(['blue', 'pink', 'yellow']));
  });

  it('works with null counts', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.highlightColorFiltersWithContent({
      summary: {
        totalCountsPerPage: null,
      },
    } as any)).toEqual(new Set());
  });
});
