import { parseConsentPreferences } from './consentPreferences';

describe('parseConsentPreferences', () => {
  it('returns both lists', () => {
    expect(parseConsentPreferences({accepted: ['analytics'], rejected: ['advertisement']}))
      .toEqual({accepted: ['analytics'], rejected: ['advertisement']});
  });

  it('fills in missing or invalid lists', () => {
    expect(parseConsentPreferences({accepted: ['analytics'], rejected: 'advertisement'}))
      .toEqual({accepted: ['analytics'], rejected: []});
  });

  it('returns undefined for anything that is not an object', () => {
    expect(parseConsentPreferences(undefined)).toBeUndefined();
    expect(parseConsentPreferences(['analytics'])).toBeUndefined();
    expect(parseConsentPreferences('analytics')).toBeUndefined();
  });
});
