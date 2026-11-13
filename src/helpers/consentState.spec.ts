import createTestServices from '../test/createTestServices';
import { testAccountsUser } from '../test/mocks/userLoader';
import { getConsentState } from './consentState';
import Sentry from './Sentry';

const mockFetch = (status: number, data: any) =>
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      status,
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  );

describe('getConsentState', () => {
  const fetchBackup = fetch;
  const getAuthorizedFetchConfig = () => Promise.resolve({headers: {'X-Launch-Token': 'launch-token'}});
  const tokenConsent = {accepted: ['analytics'], rejected: []};
  const endpointConsent = {accepted: [], rejected: ['analytics']};
  const cookie = {type: 'cookie' as const};
  let userLoader: ReturnType<typeof createTestServices>['userLoader'];

  const launchSession = (tokenData: {[key: string]: any}) => ({
    type: 'launchToken' as const,
    launchToken: {tokenString: 'launch-token', tokenData: {sub: 'a_uuid', ...tokenData}},
  });

  beforeEach(() => {
    userLoader = createTestServices().userLoader;
    jest.spyOn(userLoader, 'getCurrentUser');
    jest.spyOn(userLoader, 'updateUser');
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  describe('with a launch token session', () => {
    it('uses the token\'s consent and does not save in embedded (subcontent) launches', async() => {
      (global as any).fetch = mockFetch(200, endpointConsent);

      const state = await getConsentState({
        getAuthorizedFetchConfig,
        sessionCredential: launchSession({consentPreferences: tokenConsent, consentUrl: 'https://assignable.openstax.org/consent'}),
        search: '?subcontent=true',
        userLoader,
      });

      expect(state).toEqual({consentPreferences: tokenConsent});
      expect(fetch).not.toHaveBeenCalled();
      expect(userLoader.getCurrentUser).not.toHaveBeenCalled();
    });

    it('uses the token\'s consent and does not save in full window launches without a consentUrl', async() => {
      const state = await getConsentState({
        getAuthorizedFetchConfig,
        sessionCredential: launchSession({consentPreferences: tokenConsent}),
        search: '',
        userLoader,
      });

      expect(state).toEqual({consentPreferences: tokenConsent});
      expect(userLoader.getCurrentUser).not.toHaveBeenCalled();
    });

    it('reads and saves consent at the consentUrl in full window launches', async() => {
      (global as any).fetch = mockFetch(200, endpointConsent);

      const state = await getConsentState({
        getAuthorizedFetchConfig,
        sessionCredential: launchSession({consentPreferences: tokenConsent, consentUrl: 'https://assignable.openstax.org/consent'}),
        search: '',
        userLoader,
      });

      expect(state.consentPreferences).toEqual(endpointConsent);
      expect(fetch).toHaveBeenCalledWith('https://assignable.openstax.org/consent', {headers: {'X-Launch-Token': 'launch-token'}});

      await state.saveConsent?.(tokenConsent);
      expect(fetch).toHaveBeenLastCalledWith('https://assignable.openstax.org/consent', expect.objectContaining({method: 'POST'}));
      expect(userLoader.getCurrentUser).not.toHaveBeenCalled();
      expect(userLoader.updateUser).not.toHaveBeenCalled();
    });

    it('ignores a consentUrl outside openstax.org', async() => {
      (global as any).fetch = mockFetch(200, endpointConsent);

      const state = await getConsentState({
        getAuthorizedFetchConfig,
        sessionCredential: launchSession({consentPreferences: tokenConsent, consentUrl: 'https://consent.example'}),
        search: '',
        userLoader,
      });

      expect(state).toEqual({consentPreferences: tokenConsent});
      expect(fetch).not.toHaveBeenCalled();
    });

    it('falls back to the token\'s consent, without saving, when the consentUrl fails', async() => {
      (global as any).fetch = mockFetch(500, 'broken');
      const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => undefined);

      const state = await getConsentState({
        getAuthorizedFetchConfig,
        sessionCredential: launchSession({consentPreferences: tokenConsent, consentUrl: 'https://assignable.openstax.org/consent'}),
        search: '',
        userLoader,
      });

      expect(state).toEqual({consentPreferences: tokenConsent});
      expect(captureException).toHaveBeenCalled();
    });
  });

  describe('with an auth token', () => {
    it('reads and saves consent in Accounts, even when the launch has a consentUrl', async() => {
      (global as any).fetch = mockFetch(200, endpointConsent);

      const state = await getConsentState({
        getAuthorizedFetchConfig,
        search: '',
        sessionCredential: {type: 'auth', token: 'accounts-token'},
        userLoader,
      });

      expect(state.consentPreferences).toEqual(testAccountsUser.consent_preferences);
      expect(fetch).not.toHaveBeenCalled();

      await state.saveConsent?.(tokenConsent);
      expect(userLoader.updateUser).toHaveBeenCalledWith({consent_preferences: tokenConsent});
    });
  });

  describe('with the Accounts cookie', () => {
    it('reads and saves consent in Accounts', async() => {
      const state = await getConsentState({getAuthorizedFetchConfig, search: '', sessionCredential: cookie, userLoader});

      expect(state.consentPreferences).toEqual(testAccountsUser.consent_preferences);

      await state.saveConsent?.(tokenConsent);
      expect(userLoader.updateUser).toHaveBeenCalledWith({consent_preferences: tokenConsent});
    });

    it('does not save when logged out', async() => {
      userLoader.getCurrentUser = jest.fn(() => Promise.resolve(undefined));

      const state = await getConsentState({getAuthorizedFetchConfig, search: '', sessionCredential: cookie, userLoader});

      expect(state).toEqual({consentPreferences: undefined, saveConsent: undefined});
    });
  });
});
