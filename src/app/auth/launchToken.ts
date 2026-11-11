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

// sessionStorage is shared by every REX frame in a tab. That's fine while Assignable shows one launch per tab,
// but if two REX launches are ever shown at once, a reloaded frame would get whichever token was stored last.
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

// The credentials in the url define the session:
// - a launch token (`t`) always wins, and is stored for this tab so the session survives a reload (eg. after
//   saving consent). An `auth` param alongside it is not used, so it's removed too.
// - an `auth` param without a launch token (older Assignable links) means no launch session, so any stored token
//   is discarded and `auth` is left in place, so that session survives a reload.
// - with neither, the stored token is used unless it has expired.
// Removing them from the url makes it harder to share a credential by accident, eg. by copying the address bar.
export const pullToken = (window: Window) => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlToken = searchParams.get('t');

  if (urlToken) {
    const tokenData = decodeToken(urlToken);

    if (!tokenData) {
      removeQueryParams(window, ['t']);
      tokenStorage.remove(window);
      return undefined;
    }

    removeQueryParams(window, ['t', 'auth']);
    tokenStorage.set(window, urlToken);
    return {tokenString: urlToken, tokenData};
  }

  if (searchParams.has('auth')) {
    tokenStorage.remove(window);
    return undefined;
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

const isOpenstaxUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:'
      && (url.hostname === 'openstax.org' || url.hostname.endsWith('.openstax.org'));
  } catch {
    return false;
  }
};

// Where to read and save the user's consent preferences in a full window launch.
// The token's signature isn't checked here, so only openstax.org (or a subdomain) is trusted with the launch
// token and the user's consent choices; any other consentUrl is ignored.
export const getTokenConsentUrl = (tokenData: JsonCompatibleStruct) =>
  typeof tokenData.consentUrl === 'string' && isOpenstaxUrl(tokenData.consentUrl)
    ? tokenData.consentUrl
    : undefined;
