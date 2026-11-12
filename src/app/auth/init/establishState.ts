import { getTokenSubject } from '../launchToken';
import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser, launchUser } from '../utils';

const initializer: Initializer = async({dispatch, userLoader, sessionCredential}) => {
  if (typeof(window) === 'undefined') {
    return;
  }

  // A launch token session is logged in; Accounts is not asked
  if (sessionCredential.type === 'launchToken') {
    // analytics only needs the user's id, which is the token's subject
    const uuid = getTokenSubject(sessionCredential.launchToken.tokenData);
    window.dataLayer.push({user: uuid ? {uuid} : undefined});

    dispatch(receiveUser(launchUser));
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
