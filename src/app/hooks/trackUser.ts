import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { receiveUser } from '../auth/actions';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

const trackUserHookBody: ActionHookBody<typeof receiveUser> = () => async({payload}) => {
  if (payload.isNotGdprLocation) {
    googleAnalyticsClient.setUserId(payload.uuid);
  }
};

export { trackUserHookBody };

export default actionHook(receiveUser, trackUserHookBody);
