import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { locationChange } from '../navigation/actions';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

export const hookBody: ActionHookBody<typeof locationChange> = () => (theLocationChange) => {
  googleAnalyticsClient.trackPageView(theLocationChange.payload.location.pathname);
};

export default actionHook(locationChange, hookBody);
