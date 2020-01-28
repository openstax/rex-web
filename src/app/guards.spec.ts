import * as guards from './guards';

describe('isDefined', () => {
  it('returns false for undefined', () => {
    expect(guards.isDefined(undefined)).toBe(false);
  });

  it('returns true for defined', () => {
    expect(guards.isDefined('asdf')).toBe(true);
  });
});
