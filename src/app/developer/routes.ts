import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const ROUTES_PATH = '/';

export const developerHome: Route = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "route-developer-home" */ './components/Home'),
    loading: () => null,
    modules: ['route-developer-home'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/Home')],
  }),
  getUrl: (): string => pathToRegexp.compile(ROUTES_PATH)(),
  locale: 'en',
  name: 'Developer Home',
  paths: [ROUTES_PATH, '/books/list'],
};
