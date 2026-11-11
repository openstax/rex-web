import { FetchConfig } from '@openstax/ts-utils/fetch';
import { assertWindow } from '../app/utils/browser-assertions';
import { removeQueryParams } from '../app/utils/removeQueryParams';

// TODO - remove once Assignable sends a launch token with every link to REX
// An Accounts token from the `auth` query param. 'embedded' is not a token, it asks the parent window for the user.
const getAuthQueryToken = (search: string) => {
  const authQuery = new URLSearchParams(search).get('auth');
  return authQuery && authQuery !== 'embedded' ? authQuery : undefined;
};

// A launch token is sent in the X-Launch-Token header. Without one, an `auth` query token (an Accounts SSO token)
// is sent as a bearer token for now; otherwise we rely on the Accounts cookie.
const getAuthorizedFetchConfig = (
  launchTokenString: string | undefined,
  authQueryToken: string | undefined
): FetchConfig => {
  if (launchTokenString) {
    return {headers: {'X-Launch-Token': launchTokenString}};
  }

  if (authQueryToken) {
    return {headers: {Authorization: `Bearer ${authQueryToken}`}};
  }

  return {credentials: 'include'};
};

// Picks the credential that requests to our APIs (highlights, consent) are sent with
export default (launchTokenString?: string) => {
  const window = assertWindow();
  const fetchConfig = getAuthorizedFetchConfig(launchTokenString, getAuthQueryToken(window.location.search));

  // With a launch token, `auth` is not used, so remove it to make it harder to share by accident.
  // Without one, it has to stay so the session survives a reload (eg. after saving consent to Accounts).
  if (launchTokenString) {
    removeQueryParams(window, ['auth']);
  }

  return {
    getAuthorizedFetchConfig: () => Promise.resolve(fetchConfig),
  };
};
