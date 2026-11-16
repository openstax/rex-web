import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatLaunchUser, formatUser } from '../utils';

const initializer: Initializer = async({dispatch, userLoader, sessionCredential}) => {
  if (typeof(window) === 'undefined') {
    return;
  }

  // A launch token session is logged in; Accounts is not asked
  if (sessionCredential.type === 'launchToken') {
    const user = formatLaunchUser(sessionCredential.launchToken);

    // analytics only needs the user's id
    window.dataLayer.push({user: {uuid: user.uuid}});

    dispatch(receiveUser(user));
    return;
  }

  const user = await userLoader.getCurrentUser();

  // TODO - consider moving this into the ts-utils auth loader
  window.dataLayer.push({user});

  if (user) {
    dispatch(receiveUser(formatUser(user)));
  } else {
    dispatch(receiveLoggedOut());
  }
};

export default initializer;
