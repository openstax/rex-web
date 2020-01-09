import { treeWithUnits } from '../../../test/trees';
import { book } from '../selectors';
import * as select from './selectors';

jest.mock('./constants', () => ({
  enabledForBooks: ['enabledbook'],
}));

const mockBook = book as any as jest.SpyInstance;

jest.mock('../selectors', () => ({
  book: jest.fn(),
  localState: (state: any) => ({highlights: state}),
}));

describe('isEnabled', () => {
  it('when enabled and book is whitelisted', () => {
    mockBook.mockReturnValue({id: 'enabledbook'});
    expect(select.isEnabled({enabled: true} as any)).toEqual(true);
  });

  it('when enabled and book not is whitelisted', () => {
    mockBook.mockReturnValue({id: 'book'});
    expect(select.isEnabled({enabled: true} as any)).toEqual(false);
  });

  it('when not enabled', () => {
    mockBook.mockReturnValue({id: 'enabledbook'});
    expect(select.isEnabled({enabled: false} as any)).toEqual(false);
  });
});

describe('focused', () => {
  it('gets focused highlight id', () => {
    expect(select.focused({focused: 'asdf'} as any)).toEqual('asdf');
  });
});

describe('remainingSourceCounts', () => {
  it('returns remaining', () => {
    mockBook.mockReturnValue({tree: treeWithUnits});
    expect(select.remainingSourceCounts({
      summary: {
        filters: {locationIds: ['preface', 'chapter1']},
        highlights: {
          chapter1: {page1: [{}]},
          preface: {preface: [{}, {}]},
        },
      },
      totalCountsPerPage: {page1: 1, page2: 3, preface: 2},
    } as any)).toEqual({page2: 3});
  });
});
