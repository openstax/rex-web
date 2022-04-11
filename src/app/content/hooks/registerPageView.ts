import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import * as selectNavigation from '../../navigation/selectors';
import { RouteHookBody } from '../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../types';
import { content } from '../routes';

export const hookBody: RouteHookBody<typeof content> = (services: MiddlewareAPI & AppServices) => {
  let lastTrackedLocation: any;

  return async(action) => {
    const state = services.getState();
    const pathname = selectNavigation.pathname(state);
    const query = selectNavigation.query(state);
    const prevPath = lastTrackedLocation?.pathname;
    const prevQuery = lastTrackedLocation?.query;

    const pathOrModalChanged =
      pathname !== prevPath || prevQuery?.modal !== query.modal;

    if (action.action !== 'REPLACE' && pathOrModalChanged) {
      console.log('last tracked: ', lastTrackedLocation);
      lastTrackedLocation = {query, pathname};
      console.log('new tracked: ', lastTrackedLocation);
      googleAnalyticsClient.trackPageView(pathname, query);
    }
  };
};

export default hookBody;
