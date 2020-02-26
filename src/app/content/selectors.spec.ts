import * as select from './selectors';

jest.mock('../selectors', () => ({
  localState: (state: any) => ({content: state}),
}));

describe('pageParam', () => {
  it('defaults to null', () => {
    expect(select.pageParam({} as any)).toBe(null);
  });
});
