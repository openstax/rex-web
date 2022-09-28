import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import * as selectNavigation from '../../navigation/selectors';
import { AnyRoute, RouteHookBody } from '../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../types';

export const hookBody: RouteHookBody<AnyRoute> = (services: MiddlewareAPI & AppServices) => {
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
      lastTrackedLocation = {query, pathname};
      googleAnalyticsClient.trackPageView(pathname, query);
    }
  };
};

export default hookBody;
