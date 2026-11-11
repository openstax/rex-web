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

const storageKey = 'launchToken';

// sessionStorage can be unavailable, eg. in a cross-origin iframe with storage blocked;
// then the token just doesn't survive a reload, like before it was stored
const tokenStorage = {
  get: (window: Window) => {
    try { return window.sessionStorage.getItem(storageKey); } catch { return null; }
  },
  set: (window: Window, value: string) => {
    try { window.sessionStorage.setItem(storageKey, value); } catch { /* not available */ }
  },
  remove: (window: Window) => {
    try { window.sessionStorage.removeItem(storageKey); } catch { /* not available */ }
  },
};

const isExpired = (tokenData: JsonCompatibleStruct) =>
  typeof tokenData.exp === 'number' && tokenData.exp * 1000 <= Date.now();

// A token in the url always wins, and is stored for this tab so the session survives a reload
// (eg. after saving consent). Without one, the stored token is used unless it has expired.
export const pullToken = (window: Window) => {
  const urlToken = new URLSearchParams(window.location.search).get('t');

  if (urlToken) {
    // Makes it harder to share the credential by accident, eg. by copying the address bar
    removeQueryParams(window, ['t']);

    const tokenData = decodeToken(urlToken);

    if (!tokenData) {
      tokenStorage.remove(window);
      return undefined;
    }

    tokenStorage.set(window, urlToken);
    return {tokenString: urlToken, tokenData};
  }

  const storedToken = tokenStorage.get(window);
  const storedTokenData = storedToken ? decodeToken(storedToken) : undefined;

  if (!storedToken || !storedTokenData || isExpired(storedTokenData)) {
    tokenStorage.remove(window);
    return undefined;
  }

  return {tokenString: storedToken, tokenData: storedTokenData};
};

export const useLaunchToken = () => {
  const {launchToken} = useServices();
  return launchToken?.tokenData ?? {};
};

// The token's subject, the user's Accounts uuid
export const getTokenSubject = (tokenData: JsonCompatibleStruct) =>
  typeof tokenData.sub === 'string' ? tokenData.sub : undefined;

// The token's consent preferences
export const getTokenConsentPreferences = (tokenData: JsonCompatibleStruct) =>
  parseConsentPreferences(tokenData.consentPreferences);

// Where to read and save the user's consent preferences in a full window launch
export const getTokenConsentUrl = (tokenData: JsonCompatibleStruct) =>
  typeof tokenData.consentUrl === 'string' ? tokenData.consentUrl : undefined;
