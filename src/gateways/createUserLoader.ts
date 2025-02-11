import { ApiUser } from '@openstax/ts-utils/services/authProvider';
import { browserAuthProvider } from '@openstax/ts-utils/services/authProvider/browser';
import { assertWindow } from '../app/utils';

// We always use the browserAuthProvider, which calls the API, so we can use the user type that includes more info
export type AccountsUser = ApiUser;

export default (url: string) => {
  const authProvider = browserAuthProvider({window: assertWindow()})({auth: {accountsBase: url}});

  return {
    getAuthorizedFetchConfig: authProvider.getAuthorizedFetchConfig,
    getCurrentUser: authProvider.getUser as () => Promise<AccountsUser | undefined>,
    updateUser: authProvider.updateUser,
  };
};
