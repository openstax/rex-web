import { browserAuthProvider } from '@openstax/ts-utils/dist/services/authProvider/browser';
import { assertWindow } from '../app/utils';

export interface AccountsUser {
  uuid: string;
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_not_gdpr_location: boolean;
}

export default (url: string) => {
  const authProvider = browserAuthProvider({window: assertWindow()})({auth: { accountsUrl: url }});

  // Note: previously getCurrentUser would return undefined for 403 and reject non-200 statuses,
  //       but the browserAuthProvider always returns undefined for non-200 statuses instead
  return {
    getCurrentUser: authProvider.getUser as unknown as () => Promise<AccountsUser | undefined>,
  };
};
