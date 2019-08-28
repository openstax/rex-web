import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { requestSearch } from '../content/search/actions';
import * as select from '../content/selectors';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

export const trackSearchHookBody: ActionHookBody<typeof requestSearch> = ({getState}) => async(theSearchRequest) => {
  const state = getState();
  const book = select.book(state);
  const slug = !book ? 'unknown' : book.slug;

  googleAnalyticsClient.trackEvent('REX search', theSearchRequest.payload, slug);
};

export default actionHook(requestSearch, trackSearchHookBody);
