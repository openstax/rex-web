import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const CATCH_ALL = '/books/(.*)';

type Params = {
  url: string;
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
  getUrl: (_params: Params) => '/error/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};

export const external: Route<Params> = {
  component: Loadable(loadableArgs),
  getUrl: (params: Params) => params.url,
  name: 'External',
  paths: [':url(/.*)'],
};
