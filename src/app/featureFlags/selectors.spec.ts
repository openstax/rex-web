import * as select from './selectors';

jest.mock('../selectors', () => ({
  localState: (state: any) => ({featureFlags: state}),
}));

describe('kineticBannerVariant', () => {
  it('defaults to false with nothing', () => {
    expect(select.kineticBannerVariant({} as any)).toBe(false);
  });

  it('defaults to false with only enabledFlag', () => {
    expect(select.kineticBannerVariant({kineticEnabled: true} as any)).toBe(false);
  });

  it('defaults to false with only variant', () => {
    expect(select.kineticBannerVariant({kineticBanner: 1} as any)).toBe(false);
  });

  it('returns variant when enabled', () => {
    expect(select.kineticBannerVariant({kineticEnabled: true, kineticBanner: 1} as any)).toBe(1);
  });
});
