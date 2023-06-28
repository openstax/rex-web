import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser } from '../utils';
import { AccountsUser } from '../../../gateways/createUserLoader';

const initializer: Initializer = async({dispatch, userLoader}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const user = await userLoader.getCurrentUser();

  if (user) {
    dispatch(receiveUser(formatUser(user as AccountsUser)));
  } else {
    dispatch(receiveLoggedOut());
  }
};

export default initializer;
