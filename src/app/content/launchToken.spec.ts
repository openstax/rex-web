import * as jwt from 'jsonwebtoken';
import { pullToken, decodeToken, getTokenConsentPreferences, getTokenConsentUrl, getTokenSubject } from './launchToken';
import { assertWindow } from '../utils/browser-assertions';

describe('launchToken', () => {
  beforeEach(() => {
    // pullToken stores the token for the tab, so don't let it carry between tests
    assertWindow().sessionStorage.clear();
  });

  it('decodes token', () => {
    const token = jwt.sign({
      sub: 'user-uuid',
      stuff: 'things',
    }, 'secret');

    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      writable: true,
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        search: `t=${token}&other=thing`,
      },
    });

    const result = pullToken(assertWindow());

    expect(result?.tokenString).toEqual(token);
    expect(result?.tokenData).toEqual(expect.objectContaining({sub: 'user-uuid', stuff: 'things'}));

    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname + '?other=thing'
    );
  });

  it('works without token', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        search: `other=thing`,
      },
    });

    const result = pullToken(assertWindow());

    expect(result).toBe(undefined);

    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it('works with invalid token', () => {
    const token = 'asdf';

    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      writable: true,
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        search: `t=${token}`,
      },
    });

    const result = pullToken(assertWindow());

    expect(result).toBe(undefined);

    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname
    );
  });

  it('keeps the hash when removing the token', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      writable: true,
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        hash: '#term-12',
        search: `t=asdf&other=thing`,
      },
    });

    pullToken(assertWindow());

    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname + '?other=thing#term-12'
    );
  });

  it('returns undefined when the token payload is not json', () => {
    expect(decodeToken(`a.${assertWindow().btoa('notjson')}.b`)).toBe(undefined);
  });

  describe('stored token', () => {
    const setSearch = (search: string) => {
      Object.defineProperty(assertWindow(), 'location', {
        writable: true,
        value: {...assertWindow().location, hash: '', search},
      });
    };

    beforeEach(() => {
      Object.defineProperty(assertWindow().history, 'replaceState', {writable: true, value: jest.fn()});
    });

    it('stores the url token for this tab', () => {
      const token = jwt.sign({sub: 'user-uuid'}, 'secret');
      setSearch(`t=${token}`);

      pullToken(assertWindow());

      expect(assertWindow().sessionStorage.getItem('launchToken')).toEqual(token);
    });

    it('uses the stored token when the url has none, eg. after a reload', () => {
      const token = jwt.sign({sub: 'user-uuid'}, 'secret', {expiresIn: '1h'});
      assertWindow().sessionStorage.setItem('launchToken', token);
      setSearch('other=thing');

      const result = pullToken(assertWindow());

      expect(result?.tokenString).toEqual(token);
      expect(result?.tokenData).toEqual(expect.objectContaining({sub: 'user-uuid'}));
    });

    it('prefers the url token over the stored one, and stores it instead', () => {
      const storedToken = jwt.sign({sub: 'old-launch'}, 'secret');
      const urlToken = jwt.sign({sub: 'new-launch'}, 'secret');
      assertWindow().sessionStorage.setItem('launchToken', storedToken);
      setSearch(`t=${urlToken}`);

      const result = pullToken(assertWindow());

      expect(result?.tokenString).toEqual(urlToken);
      expect(assertWindow().sessionStorage.getItem('launchToken')).toEqual(urlToken);
    });

    it('discards the stored token when the url token is invalid', () => {
      assertWindow().sessionStorage.setItem('launchToken', jwt.sign({sub: 'old-launch'}, 'secret'));
      setSearch('t=asdf');

      expect(pullToken(assertWindow())).toBe(undefined);
      expect(assertWindow().sessionStorage.getItem('launchToken')).toBe(null);
    });

    it('discards an expired stored token', () => {
      const token = jwt.sign({sub: 'user-uuid', exp: Math.floor(Date.now() / 1000) - 60}, 'secret');
      assertWindow().sessionStorage.setItem('launchToken', token);
      setSearch('');

      expect(pullToken(assertWindow())).toBe(undefined);
      expect(assertWindow().sessionStorage.getItem('launchToken')).toBe(null);
    });

    it('discards an invalid stored token', () => {
      assertWindow().sessionStorage.setItem('launchToken', 'asdf');
      setSearch('');

      expect(pullToken(assertWindow())).toBe(undefined);
      expect(assertWindow().sessionStorage.getItem('launchToken')).toBe(null);
    });

    describe('when sessionStorage is unavailable', () => {
      const storageDescriptor = Object.getOwnPropertyDescriptor(assertWindow(), 'sessionStorage');

      beforeEach(() => {
        Object.defineProperty(assertWindow(), 'sessionStorage', {
          configurable: true,
          get: () => { throw new DOMException('blocked', 'SecurityError'); },
        });
      });

      afterEach(() => {
        Object.defineProperty(assertWindow(), 'sessionStorage', storageDescriptor!);
      });

      it('still uses the url token', () => {
        const token = jwt.sign({sub: 'user-uuid'}, 'secret');
        setSearch(`t=${token}`);

        expect(pullToken(assertWindow())?.tokenString).toEqual(token);
      });

      it('has no token without one in the url', () => {
        setSearch('');

        expect(pullToken(assertWindow())).toBe(undefined);
      });
    });
  });

  describe('outside browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('works', () => {
      expect(() => decodeToken('asdf')).not.toThrow();
    });
  });

  describe('getTokenConsentPreferences', () => {
    it('returns the token\'s consent preferences', () => {
      expect(getTokenConsentPreferences({consentPreferences: {accepted: ['analytics'], rejected: ['advertisement']}}))
        .toEqual({accepted: ['analytics'], rejected: ['advertisement']});
    });

    it('fills in missing lists', () => {
      expect(getTokenConsentPreferences({consentPreferences: {accepted: ['analytics']}}))
        .toEqual({accepted: ['analytics'], rejected: []});
    });

    it('returns undefined without consent preferences', () => {
      expect(getTokenConsentPreferences({})).toBeUndefined();
      expect(getTokenConsentPreferences({consentPreferences: ['analytics']})).toBeUndefined();
    });
  });

  describe('getTokenConsentUrl', () => {
    it('returns the token\'s consent url', () => {
      expect(getTokenConsentUrl({consentUrl: 'https://consent.example/consent'})).toEqual('https://consent.example/consent');
    });

    it('returns undefined without one', () => {
      expect(getTokenConsentUrl({})).toBeUndefined();
      expect(getTokenConsentUrl({consentUrl: 5})).toBeUndefined();
    });
  });

  describe('getTokenSubject', () => {
    it('returns the token\'s subject', () => {
      expect(getTokenSubject({sub: 'a_uuid'})).toEqual('a_uuid');
    });

    it('returns undefined without one', () => {
      expect(getTokenSubject({})).toBeUndefined();
      expect(getTokenSubject({sub: 5})).toBeUndefined();
    });
  });
});
