import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { receiveLoggedOut } from '../auth/actions';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

const untrackUserHookBody: ActionHookBody<typeof receiveLoggedOut> = () => async() => {
  googleAnalyticsClient.unsetUserId();
};

export { untrackUserHookBody };

export default actionHook(receiveLoggedOut, untrackUserHookBody);
