import { Window } from '@openstax/types/lib.dom';
import type { JsonCompatibleStruct } from '@openstax/ts-utils/routing';
import { useServices } from '../context/Services';
import { removeQueryParams } from '../utils/removeQueryParams';
import { decodeToken, hasSubject, isExpired, LaunchToken } from './launchToken';

// What authorizes requests to our APIs, and where the user comes from
export type SessionCredential =
  // An Accounts token from the `auth` param; the user comes from Accounts. A launch token alongside it isn't the
  // credential, but its claims (eg. text size, analytics) still apply.
  // TODO - remove once Assignable stops sending `auth`
  | {type: 'auth', token: string, launchToken?: LaunchToken}
  // The launch token is the only credential; Accounts isn't asked
  | {type: 'launchToken', launchToken: LaunchToken}
  // The Accounts cookie
  | {type: 'cookie'};

// The launch this session came from, if any, for its claims
export const getLaunchToken = (sessionCredential: SessionCredential) =>
  sessionCredential.type === 'cookie' ? undefined : sessionCredential.launchToken;

export const useLaunchToken = (): JsonCompatibleStruct => {
  const {sessionCredential} = useServices();
  return getLaunchToken(sessionCredential)?.tokenData ?? {};
};

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

// Empty, invalid and expired tokens, and tokens without a subject, are no token
const readToken = (tokenString: string | null): LaunchToken | undefined => {
  const tokenData = tokenString ? decodeToken(tokenString) : undefined;
  return tokenString && tokenData && hasSubject(tokenData) && !isExpired(tokenData)
    ? {tokenString, tokenData}
    : undefined;
};

const launchSession = (launchToken: LaunchToken | undefined): SessionCredential => launchToken
  ? {type: 'launchToken', launchToken}
  : {type: 'cookie'};

/*
 * Reads the session's credentials from the url:
 * - `auth` (an Accounts token) wins when present, since it's what older Assignable links use. It stays in the url,
 *   so the session survives a reload. A launch token alongside it is kept for its claims, but isn't stored.
 * - otherwise a `t` in the url decides: a valid launch token is the credential and is stored for this tab, so the
 *   session survives a reload (eg. after saving consent); an empty, invalid or expired one means no launch session.
 * - with neither, the stored launch token is used unless it has expired.
 * `auth=embedded` isn't a token (it asks the parent window for the user), so it's ignored here.
 * `t` is removed from the url, which makes it harder to share by accident, eg. by copying the address bar.
 */
export const pullCredentials = (window: Window): SessionCredential => {
  const searchParams = new URLSearchParams(window.location.search);
  const authQuery = searchParams.get('auth');
  const authToken = authQuery && authQuery !== 'embedded' ? authQuery : undefined;
  const urlToken = searchParams.get('t');

  removeQueryParams(window, ['t']);

  if (authToken) {
    tokenStorage.remove(window);
    return {type: 'auth', token: authToken, launchToken: readToken(urlToken)};
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
