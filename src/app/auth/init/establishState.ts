import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser } from '../utils';

const initializer: Initializer = async({dispatch, userLoader}) => {
  if (typeof(window) === 'undefined') {
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
