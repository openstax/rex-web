import type { ConsentPreferences } from 'cookieyes';
import { FetchConfig } from '@openstax/ts-utils/fetch';
import { getTokenConsentPreferences, getTokenConsentUrl } from '../app/auth/launchToken';
import { AppServices } from '../app/types';
import createConsentClient from '../gateways/createConsentClient';
import Sentry from './Sentry';

export type ConsentState = {
  consentPreferences: ConsentPreferences | undefined;
  // where to save consent changes, if this page is responsible for saving them
  saveConsent?: (consentPreferences: ConsentPreferences) => Promise<unknown>;
};

// Launch token sessions embedded in another window (subcontent) get consent from the launch token,
// and the host window saves changes to it.
// Full window launches read and save consent at the consentUrl their launch token names.
// Everyone else (including `auth` sessions) gets consent from Accounts, and we save changes back to Accounts
// if they're logged in.
export const getConsentState = async({sessionCredential, userLoader, search, getAuthorizedFetchConfig}: {
  sessionCredential: AppServices['sessionCredential'];
  userLoader: AppServices['userLoader'];
  search: string;
  getAuthorizedFetchConfig: () => Promise<FetchConfig>;
}): Promise<ConsentState> => {
  if (sessionCredential.type === 'launchToken') {
    const {launchToken} = sessionCredential;
    const tokenConsentState = {consentPreferences: getTokenConsentPreferences(launchToken.tokenData)};
    const consentUrl = getTokenConsentUrl(launchToken.tokenData);
    const isSubcontent = new URLSearchParams(search).get('subcontent') === 'true';

    if (isSubcontent || !consentUrl) {
      return tokenConsentState;
    }

    const consentClient = createConsentClient(consentUrl, getAuthorizedFetchConfig);

    try {
      return {
        consentPreferences: await consentClient.getConsentPreferences(),
        saveConsent: consentClient.updateConsentPreferences,
      };
    } catch (error) {
      Sentry.captureException(error);
      return tokenConsentState;
    }
  }

  const user = await userLoader.getCurrentUser();
  return {
    consentPreferences: user?.consent_preferences,
    saveConsent: user
      ? (consentPreferences) => userLoader.updateUser({ consent_preferences: consentPreferences })
      : undefined,
  };
};
