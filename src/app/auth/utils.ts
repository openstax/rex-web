import { AccountsUser } from '../../gateways/createUserLoader';
import { LaunchToken } from './launchToken';
import { AccountsProfileUser, LaunchUser } from './types';

export const formatUser = (user: AccountsUser): AccountsProfileUser => ({
  source: 'accounts',
  firstName: user.first_name,
  isNotGdprLocation: user.is_not_gdpr_location,
  lastName: user.last_name,
  uuid: user.uuid,
});

// launchToken is unverified in the client, data we use here is untrusted.
// backend calls verify the token before doing anything on behalf of the user.
export const formatLaunchUser = (launchToken: LaunchToken): LaunchUser => ({
  source: 'launch',
  uuid: launchToken.tokenData.sub,
});
