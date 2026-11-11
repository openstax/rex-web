import { Window } from '@openstax/types/lib.dom';
import type { JsonCompatibleStruct } from '@openstax/ts-utils/routing';
import { parseConsentPreferences } from '../../helpers/consentPreferences';
import { useServices } from '../context/Services';
import { removeQueryParams } from '../utils/removeQueryParams';

export const decodeToken = (launchToken: string | undefined) => {
  if (!launchToken || typeof window === 'undefined') return undefined;

  try {
    // https://stackoverflow.com/a/38552302/14809536
    const base64Url = launchToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return undefined;
  }
};

export const pullToken = (window: Window) => {
  const launchToken = new URLSearchParams(window.location.search).get('t');

  if (!launchToken) {
    return undefined;
  }

  // Makes it harder to share the credential by accident, eg. by copying the address bar
  removeQueryParams(window, ['t']);

  const tokenData = decodeToken(launchToken);

  if (!tokenData) {
    return undefined;
  }

  return {tokenString: launchToken, tokenData};
};

export const useLaunchToken = () => {
  const {launchToken} = useServices();
  return launchToken?.tokenData ?? {};
};

// The token's consent preferences
export const getTokenConsentPreferences = (tokenData: JsonCompatibleStruct) =>
  parseConsentPreferences(tokenData.consentPreferences);

// Where to read and save the user's consent preferences in a full window launch
export const getTokenConsentUrl = (tokenData: JsonCompatibleStruct) =>
  typeof tokenData.consentUrl === 'string' ? tokenData.consentUrl : undefined;
