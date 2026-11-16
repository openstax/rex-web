import type { JsonCompatibleStruct } from '@openstax/ts-utils/routing';
import { parseConsentPreferences } from '../../helpers/consentPreferences';

// A token's claims are a JSON object; anything else isn't a valid token
const isClaims = (value: unknown): value is JsonCompatibleStruct =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export const decodeToken = (launchToken: string | undefined): JsonCompatibleStruct | undefined => {
  if (!launchToken || typeof window === 'undefined') return undefined;

  try {
    // https://stackoverflow.com/a/38552302/14809536
    const base64Url = launchToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const claims: unknown = JSON.parse(jsonPayload);
    return isClaims(claims) ? claims : undefined;
  } catch (e) {
    return undefined;
  }
};

// A launch token's claims always include its subject, the user's Accounts uuid
export type LaunchTokenClaims = JsonCompatibleStruct & {sub: string};

export type LaunchToken = {tokenString: string, tokenData: LaunchTokenClaims};

export const hasSubject = (tokenData: JsonCompatibleStruct): tokenData is LaunchTokenClaims =>
  typeof tokenData.sub === 'string';

export const isExpired = (tokenData: JsonCompatibleStruct) =>
  typeof tokenData.exp === 'number' && tokenData.exp * 1000 <= Date.now();

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
