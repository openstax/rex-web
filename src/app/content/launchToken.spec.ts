import * as jwt from 'jsonwebtoken';
import { pullToken, decodeToken, getTokenConsentPreferences, getTokenConsentUrl } from './launchToken';
import { assertWindow } from '../utils/browser-assertions';

describe('launchToken', () => {

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
});
