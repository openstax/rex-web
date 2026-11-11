import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const CATCH_ALL = '/books/(.*)';

type Params = {
  url: string;
  portalName?: string;
};

const loadableArgs = {
  loader: () => import(/* webpackChunkName: "LoaderCentered" */ './components/LoaderCentered'),
  loading: () => null,
  modules: ['LoaderCentered'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/LoaderCentered')],
};

export const notFound: Route<Params> = {
  component: Loadable(loadableArgs),
  getSearch: (params: Params): string => `path=${params.url}`,
  // osweb shows its 404 page inside the portal for any unknown page under the portal
  getUrl: (params: Params) => params.portalName ? `/${params.portalName}/error/404` : '/error/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};

export const external: Route<Params> = {
  component: Loadable(loadableArgs),
  getUrl: (params: Params) => params.url,
  name: 'External',
  paths: [':url(/.*)'],
};
