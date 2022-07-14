import * as guards from './guards';

describe('isDefined', () => {
  it('returns false for undefined', () => {
    expect(guards.isDefined(undefined)).toBe(false);
  });

  it('returns true for defined', () => {
    expect(guards.isDefined('asdf')).toBe(true);
  });
});

describe('isKeyOf', () => {
  it('detects key of', () => {
    expect(guards.isKeyOf({foo: 'asdf'}, 'foo')).toBe(true);
  });

  it('detects not key of', () => {
    expect(guards.isKeyOf({foo: 'asdf'}, 'asdf')).toBe(false);
  });
});
