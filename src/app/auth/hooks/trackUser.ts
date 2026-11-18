import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { receiveUser } from '../actions';

export const trackUserHookBody: ActionHookBody<typeof receiveUser> = () => async({payload}) => {
  if (payload.source === 'accounts' && payload.isNotGdprLocation) {

    googleAnalyticsClient.setUserId(payload.uuid);
  }
};

export default actionHook(receiveUser, trackUserHookBody);
