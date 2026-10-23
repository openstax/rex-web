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
    expect(guards.isPortaled({portalName: 'Portal_2'})).toBe(true);
  });

  it('rejects things without a portal name', () => {
    expect(guards.isPortaled(undefined)).toBe(false);
    expect(guards.isPortaled({activityId: 'activity'})).toBe(false);
    expect(guards.isPortaled({portalName: 1})).toBe(false);
  });

  it('rejects portal names that would put another host in a link', () => {
    expect(guards.isPortaled({portalName: '/example.invalid'})).toBe(false);
    expect(guards.isPortaled({portalName: '\\example.invalid'})).toBe(false);
    expect(guards.isPortaled({portalName: 'a/b'})).toBe(false);
    expect(guards.isPortaled({portalName: '\t'})).toBe(false);
    expect(guards.isPortaled({portalName: '\n'})).toBe(false);
    expect(guards.isPortaled({portalName: '\r'})).toBe(false);
    expect(guards.isPortaled({portalName: 'my-portal\t'})).toBe(false);
  });

  it('rejects other characters a portal slug cannot have', () => {
    expect(guards.isPortaled({portalName: ''})).toBe(false);
    expect(guards.isPortaled({portalName: 'my portal'})).toBe(false);
    expect(guards.isPortaled({portalName: 'example.invalid'})).toBe(false);
    expect(guards.isPortaled({portalName: 'a?b#c'})).toBe(false);
    expect(guards.isPortaled({portalName: 'szkoła'})).toBe(false);
  });
});
