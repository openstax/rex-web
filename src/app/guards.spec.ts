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

describe('isPortaled', () => {
  it('accepts a portal name', () => {
    expect(guards.isPortaled({portalName: 'my-portal'})).toBe(true);
  });

  it('rejects things without a portal name', () => {
    expect(guards.isPortaled(undefined)).toBe(false);
    expect(guards.isPortaled({activityId: 'activity'})).toBe(false);
    expect(guards.isPortaled({portalName: 1})).toBe(false);
  });

  it('rejects portal names that would put another host in a link', () => {
    // What decoded %2F and %5C route segments become
    expect(guards.isPortaled({portalName: '/example.invalid'})).toBe(false);
    expect(guards.isPortaled({portalName: '\\example.invalid'})).toBe(false);
    expect(guards.isPortaled({portalName: 'a/b'})).toBe(false);
  });
});
