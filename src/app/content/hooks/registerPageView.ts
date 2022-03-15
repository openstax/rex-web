import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import * as selectNavigation from '../../navigation/selectors';
import { RouteHookBody } from '../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../types';
import { content } from '../routes';

export const hookBody: RouteHookBody<typeof content> = (services: MiddlewareAPI & AppServices) => async(action) => {
    const state = services.getState();
    const pathname = selectNavigation.pathname(state);
    const query = selectNavigation.query(state);
    const prevPath = action.prevLocation?.pathname;
    const prevQuery = action.prevLocation?.query;

    const pathOrModalChanged =
      pathname !== prevPath || prevQuery?.modal !== query.modal;

    if (action.action !== 'REPLACE' && pathOrModalChanged) {
      googleAnalyticsClient.trackPageView(pathname, query);
    }
};

export default hookBody;
