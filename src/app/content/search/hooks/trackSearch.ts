import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { requestSearch } from '../actions';

export const trackSearchHookBody: ActionHookBody<typeof requestSearch> = (services) => async({payload, meta}) => {
  const {analytics, getState} = services;
  const {selector, track} = analytics.search;
  track(selector(getState()), payload, meta && meta.isResultReload);
};

export default actionHook(requestSearch, trackSearchHookBody);
