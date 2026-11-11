import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser, launchUser } from '../utils';

const initializer: Initializer = async({dispatch, userLoader, launchToken}) => {
  if (typeof(window) === 'undefined') {
    return;
  }

  // Having a launch token means we're logged in; Accounts is not asked
  if (launchToken) {
    // analytics only needs the user's id, which is the token's subject
    const uuid = launchToken.tokenData.sub;
    window.dataLayer.push({user: typeof uuid === 'string' ? {uuid} : undefined});

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
