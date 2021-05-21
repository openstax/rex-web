import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser } from '../utils';

const initializer: Initializer = async({dispatch}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  // const user = await userLoader.getCurrentUser();
  const user = null;

  if (user) {
    dispatch(receiveUser(formatUser(user)));
  } else {
    dispatch(receiveLoggedOut());
  }
};

export default initializer;
