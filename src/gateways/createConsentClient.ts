import type { ConsentPreferences } from 'cookieyes';
import { FetchConfig } from '@openstax/ts-utils/fetch';
import merge from 'lodash/fp/merge';
import { acceptStatus } from '../helpers/fetch';
import { parseConsentPreferences } from '../helpers/consentPreferences';

const formatError = (status: number, message: string) =>
  new Error(`Error response from consent endpoint ${status}: ${message}`);

// Reads and saves the user's consent preferences at the `consentUrl` a launch token names
export default (consentUrl: string, getAuthorizedFetchConfig: () => Promise<FetchConfig>) => ({
  getConsentPreferences: async() => {
    const response = await fetch(consentUrl, await getAuthorizedFetchConfig())
      .then(acceptStatus(200, formatError));

    return parseConsentPreferences(await response.json());
  },
  updateConsentPreferences: async(consentPreferences: ConsentPreferences) => {
    await fetch(consentUrl, merge(await getAuthorizedFetchConfig(), {
      body: JSON.stringify(consentPreferences),
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
    })).then(acceptStatus(200, formatError));
  },
});
