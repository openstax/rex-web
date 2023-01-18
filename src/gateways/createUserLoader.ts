import { browserAuthProvider } from '@openstax/ts-utils/services/authProvider/browser';
import { assertWindow } from '../app/utils';

export interface AccountsUser {
  uuid: string;
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  faculty_status: string;
  is_administrator: boolean;
  is_not_gdpr_location: boolean;
  contact_infos: any[];
}

export default (url: string) => {
  const authProvider = browserAuthProvider({window: assertWindow()})({auth: {accountsUrl: url}});

  return {
    getAuthorizedFetchConfig: authProvider.getAuthorizedFetchConfig,
    getCurrentUser: authProvider.getUser,
  };
};
