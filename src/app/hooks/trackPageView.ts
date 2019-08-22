import { locationChange } from '../navigation/actions';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';

export const hookBody: ActionHookBody<typeof locationChange> = () => (locationChange) => {
  googleAnalyticsClient.trackPageView(locationChange.payload.location.pathname);
};

export default actionHook(locationChange, hookBody);

