import * as select from './selectors';

jest.mock('../selectors', () => ({
  localState: (state: any) => ({highlights: state}),
}));

describe('focused', () => {
  it('gets focused highlight id', () => {
    expect(select.focused({focused: 'asdf'} as any)).toEqual('asdf');
  });
});

describe('totalCountsPerPageInSummary', () => {
  it('returns remaining', () => {
    expect(select.totalCountsPerPageInSummary({
      summary: {
        totalCounts: {
          one: 3,
          two: 1,
        },
      },
    } as any)).toEqual({one: 3, two: 1});
  });
});

describe('remainingSourceCounts', () => {
  it('returns remaining', () => {
    expect(select.remainingSourceCounts({
      summary: {
        filteredTotalCounts: {
          one: 3,
          two: 1,
        },
        highlights: {
          chapter1: {
            one: [{}, {}],
          },
          chapter2: {
            two: [{}],
          },
        },
      },
    } as any)).toEqual({one: 1, two: 0});
  });
});
