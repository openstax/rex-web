import { browserAuthProvider } from '@openstax/ts-utils/services/authProvider/browser';
import { assertWindow } from '../app/utils';

export default (url: string) => {
  const authProvider = browserAuthProvider({window: assertWindow()})({auth: {accountsBase: url}});

  return {
    getAuthorizedFetchConfig: authProvider.getAuthorizedFetchConfig,
    getCurrentUser: authProvider.getUser,
    updateUser: authProvider.updateUser,
  };
};
