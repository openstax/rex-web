import * as jwt from 'jsonwebtoken';
import { assertWindow } from '../utils/browser-assertions';
import { pullCredentials } from './credentials';

describe('pullCredentials', () => {
  let replaceStateSpy: jest.Mock;

  const setLocation = (search: string, hash = '') => {
    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {...assertWindow().location, hash, search},
    });
  };

  const storedToken = () => assertWindow().sessionStorage.getItem('launchToken');
  const validToken = (sub = 'user-uuid') => jwt.sign({sub}, 'secret', {expiresIn: '1h'});
  const expiredToken = () => jwt.sign({sub: 'user-uuid', exp: Math.floor(Date.now() / 1000) - 60}, 'secret');

  beforeEach(() => {
    assertWindow().sessionStorage.clear();
    replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {writable: true, value: replaceStateSpy});
  });

  describe('with a launch token in the url', () => {
    it('uses it as the credential and stores it for this tab', () => {
      const token = validToken();
      setLocation(`t=${token}`);

      const {launchToken, sessionCredential} = pullCredentials(assertWindow());

      expect(launchToken?.tokenData).toEqual(expect.objectContaining({sub: 'user-uuid'}));
      expect(sessionCredential).toEqual({type: 'launchToken', launchToken});
      expect(storedToken()).toEqual(token);
    });

    it('removes it from the url, keeping other params and the hash', () => {
      setLocation(`t=${validToken()}&other=thing`, '#term-12');

      pullCredentials(assertWindow());

      expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
        assertWindow().location.pathname + '?other=thing#term-12'
      );
    });

    it('replaces a stored token', () => {
      assertWindow().sessionStorage.setItem('launchToken', validToken('old-launch'));
      const token = validToken('new-launch');
      setLocation(`t=${token}`);

      expect(pullCredentials(assertWindow()).launchToken?.tokenString).toEqual(token);
      expect(storedToken()).toEqual(token);
    });

    it.each([
      ['empty', ''],
      ['invalid', 'asdf'],
      ['non-object', `a.${assertWindow().btoa('[]')}.b`],
      ['expired', expiredToken()],
    ])('treats an %s one as no launch session and discards the stored token', (_, token) => {
      assertWindow().sessionStorage.setItem('launchToken', validToken('old-launch'));
      setLocation(`t=${token}`);

      expect(pullCredentials(assertWindow())).toEqual({launchToken: undefined, sessionCredential: {type: 'cookie'}});
      expect(storedToken()).toBe(null);
    });

    it('ignores auth=embedded, which isn\'t a token, and leaves it in the url', () => {
      setLocation(`t=${validToken()}&auth=embedded`);

      expect(pullCredentials(assertWindow()).sessionCredential.type).toEqual('launchToken');
      expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
        assertWindow().location.pathname + '?auth=embedded'
      );
    });
  });

  describe('with an auth param in the url', () => {
    it('uses it as the credential and leaves it in the url, so it survives a reload', () => {
      setLocation('auth=accounts-token');

      expect(pullCredentials(assertWindow())).toEqual({
        launchToken: undefined,
        sessionCredential: {type: 'auth', token: 'accounts-token'},
      });
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('prefers it over a launch token, which is still read for its claims but not stored', () => {
      setLocation(`t=${validToken()}&auth=accounts-token`);

      const {launchToken, sessionCredential} = pullCredentials(assertWindow());

      expect(sessionCredential).toEqual({type: 'auth', token: 'accounts-token'});
      expect(launchToken?.tokenData).toEqual(expect.objectContaining({sub: 'user-uuid'}));
      expect(storedToken()).toBe(null);
      expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
        assertWindow().location.pathname + '?auth=accounts-token'
      );
    });

    it('discards a stored token', () => {
      assertWindow().sessionStorage.setItem('launchToken', validToken('old-launch'));
      setLocation('auth=accounts-token');

      expect(pullCredentials(assertWindow()).launchToken).toBe(undefined);
      expect(storedToken()).toBe(null);
    });
  });

  describe('without credentials in the url', () => {
    it('uses the stored token, eg. after a reload', () => {
      const token = validToken();
      assertWindow().sessionStorage.setItem('launchToken', token);
      setLocation('other=thing');

      const {launchToken, sessionCredential} = pullCredentials(assertWindow());

      expect(launchToken?.tokenString).toEqual(token);
      expect(sessionCredential).toEqual({type: 'launchToken', launchToken});
    });

    it.each([
      ['invalid', 'asdf'],
      ['expired', expiredToken()],
    ])('discards an %s stored token', (_, token) => {
      assertWindow().sessionStorage.setItem('launchToken', token);
      setLocation('');

      expect(pullCredentials(assertWindow())).toEqual({launchToken: undefined, sessionCredential: {type: 'cookie'}});
      expect(storedToken()).toBe(null);
    });

    it('uses the cookie when nothing is stored', () => {
      setLocation('');

      expect(pullCredentials(assertWindow())).toEqual({launchToken: undefined, sessionCredential: {type: 'cookie'}});
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });
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
      const token = validToken();
      setLocation(`t=${token}`);

      expect(pullCredentials(assertWindow()).launchToken?.tokenString).toEqual(token);
    });

    it('uses the cookie without one', () => {
      setLocation('');

      expect(pullCredentials(assertWindow()).sessionCredential).toEqual({type: 'cookie'});
    });

    it('still uses the auth param', () => {
      setLocation('auth=accounts-token');

      expect(pullCredentials(assertWindow()).sessionCredential).toEqual({type: 'auth', token: 'accounts-token'});
    });
  });
});
