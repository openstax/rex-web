import { User } from '@openstax/ts-utils/services/authProvider';
import { browserAuthProvider } from '@openstax/ts-utils/services/authProvider/browser';
import { assertWindow } from '../app/utils';

// TODO - update tst to include these fields
export type AccountsUser = User & {
  self_reported_role: string;
  using_openstax: boolean;
};

export default (url: string) => {
  const authProvider = browserAuthProvider({window: assertWindow()})({auth: {accountsUrl: url}});

  return {
    getAuthorizedFetchConfig: authProvider.getAuthorizedFetchConfig,
    getCurrentUser: authProvider.getUser as () => Promise<AccountsUser | undefined>,
  };
};
