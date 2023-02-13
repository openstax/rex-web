import createUserLoader, { AccountsUser } from '../../gateways/createUserLoader';

export const testAccountsUser: AccountsUser = {
  contact_infos: [],
  faculty_status: 'no_faculty_info',
  first_name: 'testy',
  full_name: 'testy mctesterson',
  id: 1,
  is_administrator: false,
  is_not_gdpr_location: true,
  last_name: 'mctesterson',
  name: 'test',
  uuid: 'e567b65d-c958-486e-b2f3-496f10828906',
};

export default (): ReturnType<typeof createUserLoader> => ({
  getAuthorizedFetchConfig: () => Promise.resolve({credentials: 'include'}),
  getCurrentUser: () => Promise.resolve(testAccountsUser),
});
