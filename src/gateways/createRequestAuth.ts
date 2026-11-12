import { FetchConfig } from '@openstax/ts-utils/fetch';
import type { SessionCredential } from '../app/auth/credentials';

const getAuthorizedFetchConfig = (sessionCredential: SessionCredential): FetchConfig => {
  switch (sessionCredential.type) {
    case 'auth':
      return {headers: {Authorization: `Bearer ${sessionCredential.token}`}};
    case 'launchToken':
      return {headers: {'X-Launch-Token': sessionCredential.launchToken.tokenString}};
    case 'cookie':
      return {credentials: 'include'};
  }
};

// The credential that requests to our APIs (highlights, consent) are sent with
export default (sessionCredential: SessionCredential) => {
  const fetchConfig = getAuthorizedFetchConfig(sessionCredential);

  return {
    getAuthorizedFetchConfig: () => Promise.resolve(fetchConfig),
  };
};
