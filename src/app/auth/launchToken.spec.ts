import * as jwt from 'jsonwebtoken';
import { decodeToken, getTokenConsentPreferences, getTokenConsentUrl, hasSubject, isExpired } from './launchToken';
import { assertWindow } from '../utils/browser-assertions';

describe('launchToken', () => {
  describe('decodeToken', () => {
    it('decodes the payload', () => {
      expect(decodeToken(jwt.sign({sub: 'user-uuid', stuff: 'things'}, 'secret')))
        .toEqual(expect.objectContaining({sub: 'user-uuid', stuff: 'things'}));
    });

    it('returns undefined for an invalid token', () => {
      expect(decodeToken('asdf')).toBe(undefined);
    });

    it.each([
      ['an array', []],
      ['a number', 42],
      ['a string', 'not-claims'],
      ['null', null],
    ])('returns undefined when the payload is %s, not an object of claims', (_, payload) => {
      expect(decodeToken(`a.${assertWindow().btoa(JSON.stringify(payload))}.b`)).toBe(undefined);
    });

    it('returns undefined when the token payload is not json', () => {
      expect(decodeToken(`a.${assertWindow().btoa('notjson')}.b`)).toBe(undefined);
    });
  });

  describe('isExpired', () => {
    it('is expired once exp has passed', () => {
      expect(isExpired({exp: Math.floor(Date.now() / 1000) - 60})).toBe(true);
    });

    it('is not expired before exp, or without one', () => {
      expect(isExpired({exp: Math.floor(Date.now() / 1000) + 60})).toBe(false);
      expect(isExpired({})).toBe(false);
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
    it('returns the token\'s consent url on openstax.org or a subdomain', () => {
      expect(getTokenConsentUrl({consentUrl: 'https://openstax.org/consent'})).toEqual('https://openstax.org/consent');
      expect(getTokenConsentUrl({consentUrl: 'https://assignable.openstax.org/api/consent'}))
        .toEqual('https://assignable.openstax.org/api/consent');
    });

    it('ignores consent urls anywhere else', () => {
      expect(getTokenConsentUrl({consentUrl: 'https://consent.example/consent'})).toBeUndefined();
      expect(getTokenConsentUrl({consentUrl: 'https://evilopenstax.org/consent'})).toBeUndefined();
      expect(getTokenConsentUrl({consentUrl: 'https://openstax.org.example.com/consent'})).toBeUndefined();
      expect(getTokenConsentUrl({consentUrl: 'http://openstax.org/consent'})).toBeUndefined();
      expect(getTokenConsentUrl({consentUrl: 'not a url'})).toBeUndefined();
    });

    it('returns undefined without one', () => {
      expect(getTokenConsentUrl({})).toBeUndefined();
      expect(getTokenConsentUrl({consentUrl: 5})).toBeUndefined();
    });
  });

  describe('hasSubject', () => {
    it('is true with a string subject', () => {
      expect(hasSubject({sub: 'a_uuid'})).toBe(true);
    });

    it('is false without one', () => {
      expect(hasSubject({})).toBe(false);
      expect(hasSubject({sub: 5})).toBe(false);
    });
  });
});
