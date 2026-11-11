import { AccountsUser } from '../../gateways/createUserLoader';
import { AccountsProfileUser, LaunchUser } from './types';

export const formatUser = (user: AccountsUser): AccountsProfileUser => ({
  source: 'accounts',
  firstName: user.first_name,
  isNotGdprLocation: user.is_not_gdpr_location,
  lastName: user.last_name,
  uuid: user.uuid,
});

export const launchUser: LaunchUser = {source: 'launch'};
