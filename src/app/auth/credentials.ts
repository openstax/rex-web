import { Window } from '@openstax/types/lib.dom';
import { removeQueryParams } from '../utils/removeQueryParams';
import { decodeToken, isExpired, LaunchToken } from './launchToken';

// What authorizes requests to our APIs, and where the user comes from
export type SessionCredential =
  // An Accounts token from the `auth` param; the user comes from Accounts.
  // TODO - remove once Assignable stops sending `auth`
  | {type: 'auth', token: string}
  // The launch token is the only credential; Accounts isn't asked
  | {type: 'launchToken', launchToken: LaunchToken}
  // The Accounts cookie
  | {type: 'cookie'};

// sessionStorage is shared by every REX frame in a tab. That's fine while Assignable shows one launch per tab,
// but if two REX launches are ever shown at once, a reloaded frame would get whichever token was stored last.
const storageKey = 'launchToken';

// sessionStorage can be unavailable, eg. in a cross-origin iframe with storage blocked;
// then the token just doesn't survive a reload
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

// Empty, invalid and expired tokens are no token
const readToken = (tokenString: string | null): LaunchToken | undefined => {
  const tokenData = tokenString ? decodeToken(tokenString) : undefined;
  return tokenString && tokenData && !isExpired(tokenData) ? {tokenString, tokenData} : undefined;
};

const launchSession = (launchToken: LaunchToken | undefined) => ({
  launchToken,
  sessionCredential: launchToken
    ? {type: 'launchToken' as const, launchToken}
    : {type: 'cookie' as const},
});

/*
 * Reads the session's credentials from the url:
 * - `auth` (an Accounts token) wins when present, since it's what older Assignable links use. It stays in the url,
 *   so the session survives a reload. A launch token alongside it is still read for its other claims (eg. text
 *   size), but isn't the credential or stored.
 * - otherwise a `t` in the url decides: a valid launch token is the credential and is stored for this tab, so the
 *   session survives a reload (eg. after saving consent); an empty, invalid or expired one means no launch session.
 * - with neither, the stored launch token is used unless it has expired.
 * `auth=embedded` isn't a token (it asks the parent window for the user), so it's ignored here.
 * `t` is removed from the url, which makes it harder to share by accident, eg. by copying the address bar.
 */
export const pullCredentials = (window: Window): {
  launchToken: LaunchToken | undefined;
  sessionCredential: SessionCredential;
} => {
  const searchParams = new URLSearchParams(window.location.search);
  const authQuery = searchParams.get('auth');
  const authToken = authQuery && authQuery !== 'embedded' ? authQuery : undefined;
  const urlToken = searchParams.get('t');

  removeQueryParams(window, ['t']);

  if (authToken) {
    tokenStorage.remove(window);
    return {launchToken: readToken(urlToken), sessionCredential: {type: 'auth', token: authToken}};
  }

  if (urlToken !== null) {
    const launchToken = readToken(urlToken);

    if (launchToken) {
      tokenStorage.set(window, launchToken.tokenString);
    } else {
      tokenStorage.remove(window);
    }

    return launchSession(launchToken);
  }

  const launchToken = readToken(tokenStorage.get(window));

  if (!launchToken) {
    tokenStorage.remove(window);
  }

  return launchSession(launchToken);
};
