import {
  getPortalNameFromPath,
  isK12Portal,
  portalHasResearchAgreement,
  portalIsK12,
  resetK12PortalCache,
} from './k12Portal';

const loaderFor = (result: Promise<any>) => ({getSchoolDataFromPortalName: jest.fn(() => result)});

describe('getPortalNameFromPath', () => {
  it('extracts the portal name', () => {
    expect(getPortalNameFromPath('/portal/some-school/books/b/pages/p')).toBe('some-school');
  });

  it('returns undefined for non-portal paths', () => {
    expect(getPortalNameFromPath('/books/b/pages/p')).toBeUndefined();
  });
});

describe('isK12Portal', () => {
  beforeEach(() => {
    resetK12PortalCache();
  });

  it('resolves true for K12 schools', async() => {
    expect(await isK12Portal(loaderFor(Promise.resolve({industry: 'K12'})), 'a')).toBe(true);
  });

  it('resolves false for other schools', async() => {
    expect(await isK12Portal(loaderFor(Promise.resolve({industry: 'HE'})), 'a')).toBe(false);
  });

  it('resolves false when there is no school data', async() => {
    expect(await isK12Portal(loaderFor(Promise.resolve(undefined)), 'a')).toBe(false);
  });

  it('resolves false and logs when the lookup fails', async() => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(await isK12Portal(loaderFor(Promise.reject(new Error('boom'))), 'a')).toBe(false);
    expect(error).toHaveBeenCalledWith('Error fetching school data', expect.any(Error));
    error.mockRestore();
  });

  describe('portalIsK12', () => {
    it('is true once a K12 school comes back', async() => {
      await isK12Portal(loaderFor(Promise.resolve({industry: 'K12'})), 'a');
      expect(portalIsK12('a')).toBe(true);
    });

    it('is false for a non-K12 school', async() => {
      await isK12Portal(loaderFor(Promise.resolve({industry: 'HE'})), 'a');
      expect(portalIsK12('a')).toBe(false);
    });

    it('is false when there is no school data', async() => {
      await isK12Portal(loaderFor(Promise.resolve(undefined)), 'a');
      expect(portalIsK12('a')).toBe(false);
    });

    it('is false when the lookup fails', async() => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      await isK12Portal(loaderFor(Promise.reject(new Error('boom'))), 'a');
      expect(portalIsK12('a')).toBe(false);
      error.mockRestore();
    });
  });

  describe('portalHasResearchAgreement', () => {
    it('is true for a K12 school with an active agreement', async() => {
      await isK12Portal(loaderFor(Promise.resolve({industry: 'K12', research_agreement_active: true})), 'a');
      expect(portalHasResearchAgreement('a')).toBe(true);
    });

    it('is false for a K12 school without an active agreement', async() => {
      await isK12Portal(loaderFor(Promise.resolve({industry: 'K12', research_agreement_active: false})), 'a');
      expect(portalHasResearchAgreement('a')).toBe(false);
    });

    it('is false for a non-K12 school with an active agreement', async() => {
      await isK12Portal(loaderFor(Promise.resolve({industry: 'HE', research_agreement_active: true})), 'a');
      expect(portalHasResearchAgreement('a')).toBe(false);
    });

    it('is false when there is no school data', async() => {
      await isK12Portal(loaderFor(Promise.resolve(undefined)), 'a');
      expect(portalHasResearchAgreement('a')).toBe(false);
    });
  });

  it('memoizes per portal name', async() => {
    const loader = loaderFor(Promise.resolve({industry: 'K12'}));
    await isK12Portal(loader, 'a');
    await isK12Portal(loader, 'a');
    await isK12Portal(loader, 'b');
    expect(loader.getSchoolDataFromPortalName).toHaveBeenCalledTimes(2);
  });
});
